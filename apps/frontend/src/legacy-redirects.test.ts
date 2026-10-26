// The retired Nomia frontend's URLs (src/lib/legacy-redirects.ts): each moved
// one is sent where its content lives now, before any CMS read.
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { legacyRedirect } from "./lib/legacy-redirects";
import Entry from "./pages/[...slug].astro";

describe("legacyRedirect", () => {
  test.each([
    ["/boas-praticas/", "/biblioteca/boas-praticas/"],
    ["/glossario", "/biblioteca/glossario/"],
    ["/oportunidades/premios/", "/oportunidades/concursos-e-premios/"],
    ["/economia-circular/indicadores/", "/economia-circular/indicadores-economia-circular/"],
    ["/noticias/redesenhar-os-jeans/", "/2026/05/14/redesenhar-os-jeans/"],
    ["/noticias-eventos/redesenhar-os-jeans/", "/2026/05/14/redesenhar-os-jeans/"],
    [
      "/biblioteca/estrategia-europeia-para-os-plasticos/",
      "/biblioteca/documento/estrategia-europeia-para-os-plasticos/",
    ],
    ["/oportunidades/go-parity/", "/oportunidades/oportunidade/go-parity/"],
    ["/pt/legislacao/", "/biblioteca/legislacao/"],
    ["/pt/contactos/", "/contactos/"],
    ["/pt/", "/"],
    ["/en/", "/"],
    ["/en/eventos/x/", "/"],
  ])("%s → %s", (path, target) => {
    expect(legacyRedirect(path)).toBe(target);
  });

  test.each([
    "/",
    "/contactos/",
    "/noticias/",
    "/biblioteca/boas-praticas/",
    "/2026/05/14/redesenhar-os-jeans/",
    "/entry/",
  ])("%s isn't an old URL", (path) => {
    expect(legacyRedirect(path)).toBeNull();
  });
});

describe("the entry route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("answers an old URL with a permanent redirect, without reading the CMS", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error("no CMS read expected")));
    vi.stubGlobal("fetch", fetchMock);
    const container = await AstroContainer.create();

    const response = await container.renderToResponse(Entry, {
      request: new Request("https://nomia.example/boas-praticas/"),
      params: { slug: "boas-praticas" },
      partial: false,
    });

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe("/biblioteca/boas-praticas/");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
