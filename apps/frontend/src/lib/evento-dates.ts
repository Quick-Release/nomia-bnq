/** Portuguese date line for event cards (homepage / listings). */
export function formatEventDateRangePt(
  start: string | null,
  end: string | null,
  fallbackIso: string | null,
): string {
  const df = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const noon = (iso: string) => new Date(`${iso.trim()}T12:00:00`);

  if (start?.trim() && end?.trim()) {
    const a = noon(start);
    const b = noon(end);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
    if (a.getTime() === b.getTime()) return df.format(a);
    return `${df.format(a)} até ${df.format(b)}`;
  }
  if (start?.trim()) {
    const a = noon(start);
    return Number.isNaN(a.getTime()) ? "" : df.format(a);
  }
  if (fallbackIso?.trim()) {
    const d = new Date(fallbackIso);
    if (!Number.isNaN(d.getTime())) return `Publicado a ${df.format(d)}`;
  }
  return "";
}
