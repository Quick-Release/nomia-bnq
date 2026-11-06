import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import manifestJson from "../components/interactive-images/economia-circular.slots.json";
import {
  readEconomiaCircularContent,
  readInteractiveImageKey,
  renderInteractiveSvg,
  type SlotManifest,
} from "./interactive-images";

const svg = readFileSync(
  new URL("../components/interactive-images/economia-circular.svg", import.meta.url),
  "utf8",
);
const manifest = manifestJson as SlotManifest;
const STEPS = [1, 2, 3, 4, 5, 6];
const none = { texts: {}, icons: {} };
const render = (content = none) =>
  renderInteractiveSvg(svg, manifest, content, { id: "x1", icons: "/i.webp" });

describe("readInteractiveImageKey", () => {
  it("accepts a known image", () => {
    expect(readInteractiveImageKey("economia-circular")).toBe("economia-circular");
  });

  it("rejects anything else", () => {
    expect(readInteractiveImageKey("")).toBeNull();
    expect(readInteractiveImageKey("other")).toBeNull();
    expect(readInteractiveImageKey(undefined)).toBeNull();
    expect(readInteractiveImageKey(1)).toBeNull();
  });
});

describe("economia-circular.svg", () => {
  const count = (pattern: RegExp) => svg.match(pattern)?.length ?? 0;

  it("has one focusable step, card and info box per step of the circular model", () => {
    for (const step of STEPS) {
      expect(svg).toContain(`class="ec-hit" data-step="${step}" tabindex="0" role="button"`);
      expect(svg).toContain(`class="ec-card" data-step="${step}"`);
      expect(svg).toContain(`class="ec-info" data-step="${step}" id="__ID__-info-${step}"`);
      expect(svg).toContain(`aria-controls="__ID__-info-${step}"`);
      expect(svg).toMatch(new RegExp(`class="ec-slice" data-steps="[^"]*\\b${step}\\b`));
    }
  });

  it("keeps every ID per instance and the icon image as a placeholder", () => {
    expect(count(/\bid="(?!__ID__-)/g)).toBe(0);
    expect(count(/url\(#(?!__ID__-)/g)).toBe(0);
    expect(svg).toContain('href="__ICONS__"');
    expect(svg).not.toContain("data:image");
  });

  it("has a slot for every text and icon in the manifest, holding only text or the icon", () => {
    const textSlots = [...svg.matchAll(/<g data-slot="([^"]+)">([\s\S]*?)<\/g>/g)];
    expect(textSlots.map((m) => m[1]).sort()).toEqual(Object.keys(manifest.texts).sort());
    for (const [, , inner] of textSlots) expect(inner).toMatch(/^(<text [^>]*>[^<]*<\/text>)+$/);
    const iconSlots = [...svg.matchAll(/<g data-icon="([^"]+)">([\s\S]*?)<\/g>/g)];
    expect(iconSlots.map((m) => m[1]).sort()).toEqual(Object.keys(manifest.icons).sort());
    for (const [, , inner] of iconSlots)
      expect(inner).toMatch(/^<clipPath [^>]*>.*<\/clipPath><use [^>]*\/>$/);
  });

  it("puts each step's texts and icon inside that step's card or info box", () => {
    for (const step of STEPS) {
      const card = svg.match(
        new RegExp(`<g class="ec-card" data-step="${step}">([\\s\\S]*?)<g class="ec-`),
      )![1];
      expect(card).toContain(`data-slot="step-${step}-title"`);
      expect(card).toContain(`data-slot="step-${step}-description"`);
      expect(card).toContain(`data-icon="step-${step}"`);
      const info = svg.match(new RegExp(`id="__ID__-info-${step}">([\\s\\S]*?)\\n`))![1];
      expect(info).toContain(`data-slot="step-${step}-info"`);
    }
  });
});

describe("readEconomiaCircularContent", () => {
  it("maps the block's attributes to slots, rows by position", () => {
    const content = readEconomiaCircularContent({
      title: "Ignorado",
      linearHeading: "  Linear  ",
      linearInfo: "Detalhe",
      centerIconSrc: "https://nomia-media.bnq.pt/uploads/logo.svg",
      steps: [{}, { title: "Etapa 2", info: "Info 2", iconSrc: "/icon.svg" }],
      linearSteps: [{ label: "Extrair!" }],
      regenerationItems: [null, null, null, null, { label: "Compostagem" }, { label: "ignored" }],
    });
    expect(content.texts).toEqual({
      "linear-heading": "Linear",
      "linear-info": "Detalhe",
      "step-2-title": "Etapa 2",
      "step-2-info": "Info 2",
      "linear-1": "Extrair!",
      "regeneration-5": "Compostagem",
    });
    expect(content.icons).toEqual({
      center: "https://nomia-media.bnq.pt/uploads/logo.svg",
      "step-2": "/icon.svg",
    });
  });

  it("leaves out empty values and unsafe icon URLs", () => {
    const content = readEconomiaCircularContent({
      linearHeading: "   ",
      circularHeading: 3,
      steps: "nope",
      centerIconSrc: "javascript:alert(1)",
      linearSteps: [
        { iconSrc: "//evil.example/x.svg" },
        { iconSrc: "http://insecure.example/x.svg" },
        { iconSrc: 'https://x.example/a.svg" onload="x' },
      ],
    });
    expect(content).toEqual({ texts: {}, icons: {} });
  });
});

describe("renderInteractiveSvg", () => {
  it("keeps the graphic as drawn when nothing is edited", () => {
    const out = render();
    expect(out).not.toContain("foreignObject");
    expect(out).not.toContain("data-edited");
    expect(out).not.toMatch(/__(ID|ICONS|LABEL)/);
    expect(out).toContain('aria-labelledby="x1-title"');
    expect(out).toContain('aria-label="Prevenir e repensar"');
    expect(out.replaceAll("x1", "__ID__").replaceAll("/i.webp", "__ICONS__")).toBe(
      svg.replace(/__LABEL_(\d)__/g, (_m, s: string) => manifest.texts[`step-${s}-title`]!.default),
    );
  });

  it("replaces an edited text with wrapping HTML text on the original baseline", () => {
    const slot = manifest.texts["step-3-info"]!;
    const out = render({ texts: { "step-3-info": "Linha <um>\nLinha & dois" }, icons: {} });
    const group = out.match(/<g data-slot="step-3-info" data-edited="">([\s\S]*?)<\/g>/)![1];
    expect(group).toContain(`x="${slot.x}"`);
    expect(group).toContain(`width="${slot.width}"`);
    const top =
      slot.baseline -
      ((slot.lineHeight - (manifest.ascent + manifest.descent) * slot.size) / 2 +
        manifest.ascent * slot.size);
    expect(group).toContain(`y="${top.toFixed(2)}"`);
    expect(group).toContain(`font-size:${slot.size}px`);
    expect(group).toContain("white-space:pre-line");
    expect(group).toContain("Linha &lt;um&gt;\nLinha &amp; dois");
    expect(out).not.toContain(slot.default.split(" ").slice(0, 3).join(" ") + " ");
    // Other slots are untouched.
    expect(out).toContain(">Integrar a durabilidade,<");
    expect(out.match(/data-edited/g)).toHaveLength(1);
  });

  it("never rewrites the editor's text or URLs as placeholders", () => {
    const out = render({
      texts: {
        "step-2-info": "__ID__ __ICONS__ __LABEL__ __LABEL_1__",
        "step-3-title": "a __ID__ b",
      },
      icons: { "step-4": "https://cdn.example/__ID__.svg" },
    });
    expect(out).toContain(">__ID__ __ICONS__ __LABEL__ __LABEL_1__</div>");
    expect(out).toContain('aria-label="a __ID__ b"');
    expect(out).toContain('href="https://cdn.example/__ID__.svg"');
    expect(out).toContain('id="x1-info-2"');
  });

  it("labels the step buttons with their edited titles", () => {
    const out = render({ texts: { "step-1-title": "Prevenir & evitar" }, icons: {} });
    expect(out).toContain('aria-label="Prevenir &amp; evitar"');
  });

  it("replaces an edited icon with the uploaded image in the icon's box", () => {
    const box = manifest.icons["regeneration-2"]!;
    const out = render({ texts: {}, icons: { "regeneration-2": "https://cdn.example/agua.svg" } });
    expect(out).toContain(
      `<g data-icon="regeneration-2" data-edited=""><image href="https://cdn.example/agua.svg" x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" preserveAspectRatio="xMidYMid meet"/></g>`,
    );
    expect(out.match(/<g data-icon="/g)).toHaveLength(Object.keys(manifest.icons).length);
  });
});

describe("the heading", () => {
  it("is the graphic's own title and subtitle, which the SVG doesn't draw", () => {
    expect(manifest.heading).toEqual({
      title: "Economia Circular",
      subtitle: "Do modelo linear ao modelo circular",
    });
    expect(svg).not.toContain(">Economia Circular<");
    expect(svg).not.toContain("Do modelo linear ao modelo circular");
  });
});

describe("the CMS editor's placeholders", () => {
  it("are the graphic's own texts", () => {
    const editor = readFileSync(
      new URL(
        "../../../cms/web/app/plugins/gq-bioeconomia/blocks/interactive-image/index.js",
        import.meta.url,
      ),
      "utf8",
    );
    const block = editor.match(/const DEFAULTS = \{([\s\S]*?)\n {2}\};/)![1];
    // The object literal from our own editor script, evaluated in an empty context.
    const defaults = runInNewContext(`({${block}})`) as Record<string, string>;
    expect(defaults).toEqual(
      Object.fromEntries(Object.entries(manifest.texts).map(([k, v]) => [k, v.default])),
    );
  });
});
