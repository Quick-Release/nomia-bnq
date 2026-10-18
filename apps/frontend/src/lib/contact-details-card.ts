const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const point =
        code[1] === "x" || code[1] === "X"
          ? Number.parseInt(code.slice(2), 16)
          : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : entity;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

/**
 * Splits the card's details into display lines.
 *
 * The editor stores the details as RichText HTML where each line is separated
 * by `<br>`; older or pasted content may use newlines instead. Tags are
 * stripped and entities decoded so Astro escapes the text exactly once.
 */
export function contactDetailsLines(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/<br\s*\/?>|\r?\n/i)
    .map((line) =>
      decodeEntities(line.replace(/<[^>]*>/g, ""))
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

/** A stretch of card text with one combination of the allowed formats. */
export interface ContactDetailsRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

const BOLD_TAGS = new Set(["b", "strong"]);
const ITALIC_TAGS = new Set(["em", "i"]);

/**
 * Splits a RichText value into display lines of bold/italic runs.
 *
 * The editor allows only `core/bold` and `core/italic`, but the value is HTML
 * stored in a block attribute, which WordPress does not filter. So nothing is
 * passed through as markup: `<strong>`/`<b>` and `<em>`/`<i>` become flags on
 * plain-text runs, `<br>` and newlines end a line, every other tag is dropped
 * and entities are decoded, leaving Astro to escape the text once and emit the
 * only elements it chooses to.
 */
export function contactDetailsRichLines(value: unknown): ContactDetailsRun[][] {
  if (typeof value !== "string") return [];

  const lines: ContactDetailsRun[][] = [];
  let line: ContactDetailsRun[] = [];
  let bold = 0;
  let italic = 0;

  const endLine = () => {
    const last = line.at(-1);
    if (last) last.text = last.text.trimEnd();
    line = line.filter((run) => run.text);
    if (line.length > 0) lines.push(line);
    line = [];
  };
  const pushText = (raw: string) => {
    const previous = line.at(-1);
    let text = decodeEntities(raw).replace(/\s+/g, " ");
    if (!previous || previous.text.endsWith(" ")) text = text.trimStart();
    if (!text) return;
    const format = { bold: bold > 0, italic: italic > 0 };
    if (previous && previous.bold === format.bold && previous.italic === format.italic) {
      previous.text += text;
    } else {
      line.push({ text, ...format });
    }
  };

  for (const part of value.split(/(<[^>]*>|\r?\n)/)) {
    const tag = /^<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>$/i.exec(part);
    if (part === "\n" || part === "\r\n" || tag?.[2].toLowerCase() === "br") {
      endLine();
    } else if (tag) {
      const name = tag[2].toLowerCase();
      const step = tag[1] ? -1 : tag[3] ? 0 : 1;
      if (BOLD_TAGS.has(name)) bold = Math.max(0, bold + step);
      if (ITALIC_TAGS.has(name)) italic = Math.max(0, italic + step);
    } else if (!part.startsWith("<")) {
      pushText(part);
    }
  }
  endLine();
  return lines;
}
