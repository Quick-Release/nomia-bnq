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

test("all submenu items use the same uncolored styles while top-level items keep their thematic colors", async () => {
  const { document } = await render({
    hoverBackgroundColor: "#ffffff",
    hoverTextColor: "#209e97",
    thematicColors: [
      { slug: "economia-circular", color: "#4bc2bf" },
      { slug: "bioeconomia-sustentavel", color: "#a5d164" },
    ],
    menuItems: [
      { id: 1, parentId: 0, label: "Economia", url: "#", target: "" },
      {
        id: 2,
        parentId: 1,
        label: "Economia child",
        url: "/economia-circular/overview/",
        target: "",
      },
      { id: 3, parentId: 0, label: "Bioeconomia", url: "#", target: "" },
      {
        id: 4,
        parentId: 3,
        label: "Bioeconomia child",
        url: "/bioeconomia-sustentavel/overview/",
        target: "",
      },
      { id: 5, parentId: 0, label: "Other", url: "#", target: "" },
      { id: 6, parentId: 5, label: "Other child", url: "/other/overview/", target: "" },
    ],
  });
  const desktop = [
    ...document.querySelectorAll(".nomia-navigation-bar nav > ul > li > div .nomia-area-link"),
  ];
  const mobile = [
    ...document.querySelectorAll("[data-navigation-drawer] nav > ul > li > ul .nomia-area-link"),
  ];
  assert.equal(desktop.length, 3);
  assert.equal(mobile.length, 3);
  for (const link of [...desktop, ...mobile]) {
    assert.equal(link.getAttribute("style"), desktop[2].getAttribute("style"));
    assert.equal(link.style.getPropertyValue("--nomia-area-background"), "transparent");
    assert.equal(link.style.getPropertyValue("--nomia-area-foreground"), "currentColor");
  }
  const parents = document.querySelectorAll(
    ".nomia-navigation-bar nav > ul > li > .nomia-area-link",
  );
  assert.match(parents[0].getAttribute("style"), /--nomia-tematica-economia-circular-background/);
  assert.match(
    parents[1].getAttribute("style"),
    /--nomia-tematica-bioeconomia-sustentavel-background/,
  );
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
