import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { JSDOM } from "jsdom";
import { initializeListings } from "./listing-browser";

function setup(extra = "") {
  const dom = new JSDOM(
    `<section data-nomia-content-listing="thumbnail-grid"><ul data-listing-rows>
    <li data-listing-item><a href="https://example.com/1.jpg"><img alt="First"></a></li>
    <li data-listing-item><a href="https://example.com/2.jpg"><img alt="Second"></a></li>
    </ul>${extra}<dialog data-listing-dialog><button data-listing-close>Close</button><button data-listing-step="1">Next</button><p data-listing-caption></p><img data-listing-image></dialog></section>`,
    { url: "https://example.com/galeria/" },
  );
  for (const name of ["window", "document", "Element", "DOMParser"] as const)
    vi.stubGlobal(name, name === "window" ? dom.window : dom.window[name]);
  const dialog = dom.window.document.querySelector("dialog")!;
  dialog.showModal = () => {
    dialog.open = true;
  };
  dialog.close = () => {
    dialog.open = false;
    dialog.dispatchEvent(new dom.window.Event("close"));
  };
  initializeListings();
  return { dom, doc: dom.window.document, dialog };
}
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listing enhancements", () => {
  it("opens, navigates and closes the lightbox, restoring focus and scroll", () => {
    const { dom, doc, dialog } = setup();
    const trigger = doc.querySelector("a")!;
    trigger.click();
    expect(dialog.open).toBe(true);
    expect(doc.documentElement.style.overflow).toBe("hidden");
    expect(doc.querySelector<HTMLImageElement>("[data-listing-image]")!.src).toBe(
      "https://example.com/1.jpg",
    );
    dialog.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(doc.querySelector<HTMLImageElement>("[data-listing-image]")!.src).toBe(
      "https://example.com/2.jpg",
    );
    doc.querySelector<HTMLButtonElement>("[data-listing-step]")!.click();
    expect(doc.querySelector<HTMLImageElement>("[data-listing-image]")!.src).toBe(
      "https://example.com/1.jpg",
    );
    doc.querySelector<HTMLButtonElement>("[data-listing-close]")!.click();
    expect(doc.activeElement).toBe(trigger);
    expect(doc.documentElement.style.overflow).toBe("");
  });
  it("appends the next batch and makes its images navigable, then stops at the end", async () => {
    const { doc } = setup(
      '<a data-listing-more href="?pagina=2">More</a><p data-listing-status role="status"></p>',
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            '<section data-nomia-content-listing><ul data-listing-rows><li data-listing-item><a href="https://example.com/3.jpg"><img alt="Third"></a></li></ul></section>',
          ),
        ),
    );
    doc.querySelector<HTMLAnchorElement>("[data-listing-more]")!.click();
    await vi.waitFor(() => expect(doc.querySelectorAll("[data-listing-item]")).toHaveLength(3));
    expect(doc.querySelector<HTMLAnchorElement>("[data-listing-more]")!.hidden).toBe(true);
    doc.querySelectorAll<HTMLAnchorElement>("[data-listing-item] > a")[2].click();
    expect(doc.querySelector<HTMLImageElement>("[data-listing-image]")!.src).toBe(
      "https://example.com/3.jpg",
    );
  });
  it("keeps a failed batch retryable without appending duplicates", async () => {
    const { doc } = setup(
      '<a data-listing-more href="?pagina=2">More</a><p data-listing-status role="status"></p>',
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const more = doc.querySelector<HTMLAnchorElement>("[data-listing-more]")!;
    more.click();
    more.click();
    await vi.waitFor(() =>
      expect(doc.querySelector("[data-listing-status]")!.textContent).toContain("tentar novamente"),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(doc.querySelectorAll("[data-listing-item]")).toHaveLength(2);
    expect(more.hidden).toBe(false);
  });
});
