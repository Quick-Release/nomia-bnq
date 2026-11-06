"""Read page 1 of an Illustrator .ai (its PDF-compatible stream) into elements.json.

Usage: pdf2svg.py <file.ai> <elements.json>

Each path and text run becomes one element with its layer, geometry (SVG
coordinates, y down), colours and bounding box.
"""
import pikepdf, re, json, math, sys
from pikepdf import Operator

pdf = pikepdf.open(sys.argv[1])
page = pdf.pages[0]
res = page.obj.Resources
props = {str(k)[1:]: str(v.Name) for k, v in res.Properties.items()}

# ToUnicode maps per font
def tounicode(font):
    m = {}
    if '/ToUnicode' not in font: return None
    data = font.ToUnicode.read_bytes().decode('latin1')
    for blk in re.findall(r'beginbfchar(.*?)endbfchar', data, re.S):
        for a, b in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            m[int(a, 16)] = bytes.fromhex(b).decode('utf-16-be')
    for blk in re.findall(r'beginbfrange(.*?)endbfrange', data, re.S):
        for a, b, c in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', blk):
            s = int(c, 16)
            for i, code in enumerate(range(int(a, 16), int(b, 16) + 1)):
                m[code] = chr(s + i)
    return m
fonts = {}
for k, f in res.Font.items():
    base = str(f.BaseFont).split('+')[-1]
    fonts[str(k)[1:]] = dict(base=base, cid=str(f.Subtype) == '/Type0', map=tounicode(f))

WINANSI = {0x92: '’', 0x93: '“', 0x94: '”', 0x96: '–', 0x97: '—', 0x85: '…'}
def decode(fontkey, raw: bytes):
    f = fonts[fontkey]
    if f['cid']:
        return ''.join(f['map'].get(int.from_bytes(raw[i:i+2], 'big'), '?') for i in range(0, len(raw), 2))
    return ''.join(WINANSI.get(b, chr(b)) for b in raw)

def mul(a, b):  # PDF matrices [a b c d e f], result = a * b
    return [a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3], a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
            a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5]]
def ap(m, x, y): return (m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5])
H = 1024
def P(m, x, y):
    X, Y = ap(m, x, y); return f'{X:.2f},{H-Y:.2f}'

def col(vals):
    if len(vals) == 1: vals = vals * 3
    if len(vals) == 4:
        c, m_, y, k = vals; vals = [(1-c)*(1-k), (1-m_)*(1-k), (1-y)*(1-k)]
    return '#%02x%02x%02x' % tuple(round(float(v)*255) for v in vals)

st = dict(ctm=[1,0,0,1,0,0], fill='#000000', stroke='#000000', lw=1.0, dash=None, alpha=1.0)
stack = []; layer = None; out = []; path = []; pts = []
tm = tlm = None; tf = None; tsize = 1; tl = 0
gsalpha = {}
for k, g in res.ExtGState.items():
    gsalpha[str(k)[1:]] = float(g.get('/ca', 1))

def emit_path(fill, stroke):
    if not path: return
    d = ' '.join(path)
    xs = [p[0] for p in pts]; ys = [H-p[1] for p in pts]
    el = dict(kind='path', layer=layer, d=d, fill=st['fill'] if fill else None,
              stroke=st['stroke'] if stroke else None,
              lw=st['lw']*math.hypot(st['ctm'][0], st['ctm'][1]),
              dash=st['dash'], alpha=st['alpha'], bbox=[min(xs), min(ys), max(xs), max(ys)])
    out.append(el)

for operands, op in pikepdf.parse_content_stream(page):
    o = str(op)
    if o == 'BDC' and str(operands[0]) == '/OC':
        layer = props[str(operands[1])[1:]]
    elif o == 'EMC': pass
    elif o == 'q': stack.append(dict(st, ctm=list(st['ctm'])))
    elif o == 'Q': st = stack.pop()
    elif o == 'cm': st['ctm'] = mul([float(x) for x in operands], st['ctm'])
    elif o == 'rg': st['fill'] = col([float(x) for x in operands])
    elif o == 'RG': st['stroke'] = col([float(x) for x in operands])
    elif o == 'g': st['fill'] = col([float(operands[0])])
    elif o == 'G': st['stroke'] = col([float(operands[0])])
    elif o == 'k': st['fill'] = col([float(x) for x in operands])
    elif o == 'K': st['stroke'] = col([float(x) for x in operands])
    elif o == 'w': st['lw'] = float(operands[0])
    elif o == 'd': st['dash'] = [float(x) for x in operands[0]] or None
    elif o == 'gs': st['alpha'] = gsalpha.get(str(operands[0])[1:], 1)
    elif o == 'm':
        x, y = map(float, operands); path.append('M' + P(st['ctm'], x, y)); pts.append(ap(st['ctm'], x, y))
    elif o == 'l':
        x, y = map(float, operands); path.append('L' + P(st['ctm'], x, y)); pts.append(ap(st['ctm'], x, y))
    elif o == 'c':
        v = list(map(float, operands)); path.append('C' + ' '.join(P(st['ctm'], v[i], v[i+1]) for i in (0, 2, 4)))
        pts.append(ap(st['ctm'], v[4], v[5]))
    elif o in ('v', 'y'):
        v = list(map(float, operands)); path.append('C' + ' '.join(P(st['ctm'], v[i], v[i+1]) for i in ((0, 0, 2) if o=='v' else (0, 2, 2))))
        pts.append(ap(st['ctm'], v[2], v[3]))
    elif o == 'h': path.append('Z')
    elif o == 're':
        x, y, w, h = map(float, operands)
        c = [(x, y), (x+w, y), (x+w, y+h), (x, y+h)]
        path.append('M' + ' L'.join(P(st['ctm'], *p) for p in c) + ' Z'); pts.extend(ap(st['ctm'], *p) for p in c)
    elif o in ('f', 'F', 'f*'): emit_path(True, False); path = []; pts = []
    elif o in ('S', 's'): emit_path(False, True); path = []; pts = []
    elif o in ('B', 'B*', 'b', 'b*'): emit_path(True, True); path = []; pts = []
    elif o == 'n': path = []; pts = []
    elif o == 'BT': tm = tlm = [1,0,0,1,0,0]
    elif o == 'Tf': tf = str(operands[0])[1:]; tsize = float(operands[1])
    elif o == 'Tm': tm = tlm = [float(x) for x in operands]
    elif o == 'TL': tl = float(operands[0])
    elif o in ('Td', 'TD'):
        tx, ty = map(float, operands)
        if o == 'TD': tl = -ty
        tm = tlm = mul([1,0,0,1,tx,ty], tlm)
    elif o == 'T*': tm = tlm = mul([1,0,0,1,0,-tl], tlm)
    elif o in ('Tj', 'TJ'):
        if o == 'Tj': s = decode(tf, bytes(operands[0]))
        else:
            s = ''
            for item in operands[0]:
                if isinstance(item, pikepdf.String): s += decode(tf, bytes(item))
                elif float(item) < -250: s += ' '
        m = mul(tm, st['ctm'])
        size = tsize * math.hypot(m[2], m[3])
        out.append(dict(kind='text', layer=layer, text=s, x=m[4], y=H-m[5], size=size,
                        font=fonts[tf]['base'], fill=st['fill'], bbox=[m[4], H-m[5]-size, m[4]+len(s)*size*0.55, H-m[5]]))
    elif o == 'Do':
        out.append(dict(kind='xobject', layer=layer, name=str(operands[0])))
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(len(out), {l: sum(1 for e in out if e['layer']==l) for l in set(e['layer'] for e in out)})
