import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "@wordpress/block-serialization-default-parser";
import { readNomiaContactMapAlignment } from "../src/lib/nomia-contact-map.ts";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();
const MAP_URL = "https://www.google.com/maps/search/?api=1&query=Amadora";

test.after(async () => {
  await (await harnessPromise).close();
});

function contactMap(attrs) {
  const [block] = parse(
    `<!-- wp:getquick/nomia-contact-map ${JSON.stringify({ mapUrl: MAP_URL, ...attrs })} /-->`,
  );
  return block;
}

test("contact map alignment accepts only the offered choices", () => {
  assert.equal(readNomiaContactMapAlignment("full"), "full");
  assert.equal(readNomiaContactMapAlignment("left"), "left");
  assert.equal(readNomiaContactMapAlignment("wide"), "none");
  assert.equal(readNomiaContactMapAlignment(undefined), "none");
});

test("contact map renders its alignment modifier", async () => {
  const harness = await harnessPromise;
  for (const align of ["left", "right", "full"]) {
    const { document } = await harness.render(contactMap({ align }));
    const section = document.querySelector("section.nomia-contact-map");
    assert.ok(section?.classList.contains(`nomia-contact-map--align-${align}`), align);
    assert.ok(section.querySelector("iframe"));
  }
});

test("contact maps saved without alignment keep the default layout", async () => {
  const harness = await harnessPromise;
  for (const attrs of [{}, { align: "none" }, { align: "bogus" }]) {
    const { document } = await harness.render(contactMap(attrs));
    const section = document.querySelector("section.nomia-contact-map");
    assert.ok(section);
    assert.deepEqual([...section.classList], ["nomia-contact-map"]);
  }
});
