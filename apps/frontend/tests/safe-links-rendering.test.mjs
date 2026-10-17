import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { WP_CUSTOM_BLOCK_LINK_KEYS } from "../src/components/wp-blocks/custom-block-contracts.ts";
import { WP_CUSTOM_BLOCK_FIXTURES } from "../src/fixtures/wp-custom-block-fixtures.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();
const UNSAFE = "javascript:alert(1)";

test.after(async () => {
  await (await harnessPromise).close();
});

function parsed(blockName, attrs) {
  const [block] = parse(`<!-- wp:${blockName} ${JSON.stringify(attrs)} /-->`);
  return block;
}

/** Replaces every string under a link key, at any depth, and counts the swaps. */
function poison(value, keys, counter) {
  if (Array.isArray(value)) return value.map((item) => poison(item, keys, counter));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (keys.has(key) && typeof item === "string") {
        counter.count += 1;
        return [key, UNSAFE];
      }
      return [key, poison(item, keys, counter)];
    }),
  );
}

test("no block fixture renders a javascript: link from any link attribute", async () => {
  const harness = await harnessPromise;
  let poisoned = 0;
  const needsWordPress = new Set();

  for (const { label, block } of WP_CUSTOM_BLOCK_FIXTURES) {
    const keys = WP_CUSTOM_BLOCK_LINK_KEYS[block.blockName];
    if (!keys) continue;
    const counter = { count: 0 };
    const attrs = poison(block.attrs, new Set(keys), counter);
    if (counter.count === 0) continue;
    poisoned += counter.count;

    let html;
    try {
      ({ html } = await harness.render(parsed(block.blockName, attrs)));
    } catch (error) {
      // Renderers that query WordPress while rendering cannot run here; they
      // are listed below so a new one cannot slip out of the check unnoticed.
      if (error?.name !== "WordPressConfigurationError") throw error;
      needsWordPress.add(block.blockName);
      continue;
    }
    assert.doesNotMatch(html, /javascript:/i, label);
  }

  // No renderer reads WordPress on this site: pages are served from the
  // publication store.
  assert.deepEqual([...needsWordPress].sort(), []);
  // Guards against the loop silently checking nothing.
  assert.ok(poisoned >= 20, `only ${poisoned} link values were exercised`);
});

test("legacy link shapes a renderer still reads are filtered too", async () => {
  const harness = await harnessPromise;
  const cases = [
    [
      "getquick/page-hero-static",
      { title: "Título", imageSrc: "/hero.jpg", ctaLabel: "Saber mais", ctaUrl: UNSAFE },
    ],
    [
      "getquick/page-hero-static",
      { title: "Título", imageSrc: "/hero.jpg", cta: { label: "Saber mais", url: UNSAFE } },
    ],
    ["getquick/event-card-compact", { event: { title: "Evento", slug: "evento", url: UNSAFE } }],
    [
      "getquick/horizontal-scroll-with-content",
      {
        title: "Título",
        verTodosLabel: "Ver todos",
        verTodosUrl: UNSAFE,
        items: [{ title: "A", href: UNSAFE }],
      },
    ],
    [
      "getquick/page-hero-slider",
      {
        slides: [
          {
            title: "Slide",
            subtitle: "Sub",
            bgImage: "/bg.jpg",
            ctaLabel: `<a href="${UNSAFE}">Saber mais</a>`,
          },
        ],
      },
    ],
  ];

  for (const [blockName, attrs] of cases) {
    const { html } = await harness.render(parsed(blockName, attrs));
    assert.doesNotMatch(html, /javascript:/i, `${blockName} ${JSON.stringify(attrs)}`);
  }
});

test("safe links still reach the page through the dispatcher", async () => {
  const { document } = await (
    await harnessPromise
  ).render(
    parsed("getquick/page-hero-static", {
      title: "Título",
      imageSrc: "/hero.jpg",
      ctaLabel: "Saber mais",
      ctaHref: "/bioeconomia-sustentavel/",
    }),
  );

  assert.ok(document.querySelector('a[href="/bioeconomia-sustentavel/"]'));
});
