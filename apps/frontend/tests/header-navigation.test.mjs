import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();
test.after(async () => (await harnessPromise).close());

async function render(attrs = {}) {
  const [block] = parse(
    `<!-- wp:getquick/header-navigation ${JSON.stringify({
      menuId: 1,
      menuItems: [
        { id: 1, parentId: 0, label: "Parent", url: "#", target: "" },
        { id: 2, parentId: 1, label: "Child", url: "/child/", target: "" },
        { id: 3, parentId: 0, label: "Other", url: "/other/", target: "" },
      ],
      ...attrs,
    })} /-->`,
  );
  return (await harnessPromise).render(block);
}

test("navigation uses saved hover colors on desktop, submenu and drawer items", async () => {
  const { document } = await render({
    hoverBackgroundColor: "#123456",
    hoverTextColor: "#ffffff",
    submenuIconUrl: "https://example.test/arrow.svg",
  });
  const links = [...document.querySelectorAll(".nomia-area-link")];
  assert.equal(links.length, 6);
  for (const link of links) {
    assert.equal(link.style.getPropertyValue("--nomia-area-hover-background"), "#123456");
    assert.equal(link.style.getPropertyValue("--nomia-navigation-hover-text"), "#ffffff");
  }
  const icons = document.querySelectorAll("img");
  assert.equal(icons.length, 1);
  assert.equal(icons[0].getAttribute("src"), "https://example.test/arrow.svg");
  assert.equal(icons[0].getAttribute("alt"), "");
  assert.equal(icons[0].parentElement.textContent.trim(), "Parent");
});

test("existing navigation keeps thematic styles and the default chevron", async () => {
  const { document } = await render();
  assert.equal(document.querySelectorAll("img").length, 0);
  assert.ok(document.querySelector('path[d="M6 9l6 6 6-6"]'));
  const link = document.querySelector(".nomia-area-link");
  assert.equal(link.style.getPropertyValue("--nomia-navigation-hover-text"), "");
  assert.match(link.style.getPropertyValue("--nomia-area-hover-background"), /color-mix/);
});

test("invalid style values and unsafe icon URLs fall back to defaults", async () => {
  const { document } = await render({
    hoverBackgroundColor: "red; color: transparent",
    hoverTextColor: "url(https://example.test/)",
    submenuIconUrl: "javascript:alert(1)",
  });
  assert.equal(document.querySelectorAll("img").length, 0);
  assert.ok(document.querySelector('path[d="M6 9l6 6 6-6"]'));
  assert.equal(
    document
      .querySelector(".nomia-area-link")
      .style.getPropertyValue("--nomia-navigation-hover-text"),
    "",
  );
});
