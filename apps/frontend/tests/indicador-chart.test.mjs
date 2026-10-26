import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createAstroRenderHarness } from "./astro-render-harness.mjs";

const harnessPromise = createAstroRenderHarness();

after(async () => {
  await (await harnessPromise).close();
});

const section = "/src/components/charts/bar/NomiaIndicadorSection.astro";

/** IG.1 as published: Horizontal Bars, its years entered on x. */
const indicador = {
  title: "IG.1. Produtividade de recursos (milhões €/t)",
  uri: "/indicadores/ig-1-produtividade-de-recursos-milhoes-e-t/",
  chart: {
    kind: "indicador",
    id: 702,
    representation: "Horizontal Bars",
    geographicArea: "NUTS 0",
    sourceName: "INE",
    sourceUrl: "https://www.ine.pt/",
    xAxis: { label: "Euro", unit: "" },
    yAxis: { label: "Ano", unit: "" },
    points: [
      { x: "2024", y: "1.59" },
      { x: "2023", y: "1.48" },
      { x: "2022", y: "" },
    ],
  },
};

test("an Indicador renders its title, period, unit, area, values and source", async () => {
  const { document } = await (await harnessPromise).renderComponent(section, { indicador });
  const root = document.querySelector("section[data-indicador='702']");
  assert.ok(root);
  const heading = root.querySelector("h2");
  assert.equal(heading.textContent.trim(), indicador.title);
  assert.equal(root.getAttribute("aria-labelledby"), heading.id);
  assert.match(root.querySelector("header").textContent, /2023–2024/);
  assert.match(root.textContent, /Ano vs Euro/);
  assert.match(root.textContent, /NUTS 0/);
  assert.deepEqual(
    [...root.querySelectorAll("table tbody tr")].map((row) =>
      [...row.children].map((cell) => cell.textContent.trim()),
    ),
    [
      ["2023", "1,48"],
      ["2024", "1,59"],
    ],
  );
  const source = root.querySelector("a[href='https://www.ine.pt/']");
  assert.equal(source.textContent.trim(), "INE");
  assert.equal(source.getAttribute("rel"), "noopener noreferrer");
  // The chart is an island: its rows reach the client as its props.
  assert.ok(root.querySelector("astro-island"));
});

test("an Indicador without values, or with an unsafe source, renders safely", async () => {
  const harness = await harnessPromise;
  const empty = await harness.renderComponent(section, {
    indicador: { ...indicador, chart: { ...indicador.chart, points: [{ x: "", y: "2024" }] } },
  });
  assert.equal(empty.document.querySelector("section"), null);

  const unsafe = await harness.renderComponent(section, {
    indicador: { ...indicador, chart: { ...indicador.chart, sourceUrl: "javascript:alert(1)" } },
  });
  assert.equal(unsafe.document.querySelector("a"), null);
  assert.match(unsafe.document.querySelector("p").textContent, /Fonte:\s*INE/);
});

test("the block renders nothing without an Indicador, or when the store can't list them", async () => {
  const harness = await harnessPromise;
  for (const attrs of [{}, { indicadorId: 702 }]) {
    const { document } = await harness.renderAt("https://nomia.bnq.pt/economia-circular/", {
      blockName: "getquick/indicador-chart",
      attrs,
      innerBlocks: [],
      innerHTML: "",
      innerContent: [],
    });
    assert.equal(document.querySelector("section[data-indicador]"), null, JSON.stringify(attrs));
  }
});
