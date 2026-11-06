import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import { readInteractiveImageKey } from "./interactive-images";

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
  const svg = readFileSync(
    new URL("../components/interactive-images/economia-circular.svg", import.meta.url),
    "utf8",
  );
  const count = (pattern: RegExp) => svg.match(pattern)?.length ?? 0;

  it("has one focusable step, card and info box per step of the circular model", () => {
    for (const step of [1, 2, 3, 4, 5, 6]) {
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
});
