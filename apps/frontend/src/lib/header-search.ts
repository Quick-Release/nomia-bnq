/** A search form only submits to web destinations; keep fixed archive filters. */
export function searchFormTarget(
  href: string,
  origin: string,
): {
  action: string;
  fields: [string, string][];
} | null {
  if (!href || href.startsWith("#")) return null;
  try {
    const url = new URL(href, origin);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const fields = [...url.searchParams].filter(([key]) => key !== "q" && key !== "pagina");
    return {
      action: url.origin === origin ? url.pathname : `${url.origin}${url.pathname}`,
      fields,
    };
  } catch {
    return null;
  }
}
