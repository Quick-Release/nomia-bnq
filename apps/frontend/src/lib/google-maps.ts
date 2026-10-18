const GOOGLE_MAPS_HOSTS = /(^|\.)google\.[a-z.]+$|^maps\.app\.goo\.gl$/i;
const GOOGLE_MAPS_SHORT_HOST = /^maps\.app\.goo\.gl$/i;

function googleMapsEmbedSearchUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/**
 * Converts editor-friendly Google Maps links into URLs that Google allows in iframes.
 */
export function toGoogleMapsEmbedUrl(value: string, fallbackQuery = ""): string {
  const rawUrl = value.trim();
  if (!rawUrl) return "";

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return "";
  }

  if (!GOOGLE_MAPS_HOSTS.test(url.hostname)) return "";

  if (url.pathname.includes("/maps/embed")) {
    return url.toString();
  }

  const query = url.searchParams.get("query") || url.searchParams.get("q");
  if (query) {
    return googleMapsEmbedSearchUrl(query);
  }

  const placeMatch = url.pathname.match(/\/maps\/place\/([^/]+)/);
  if (placeMatch?.[1]) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return googleMapsEmbedSearchUrl(place);
  }

  const dataCoordinates = url.pathname.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataCoordinates) {
    return googleMapsEmbedSearchUrl(`${dataCoordinates[1]},${dataCoordinates[2]}`);
  }

  const coordinates = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (coordinates) {
    return googleMapsEmbedSearchUrl(`${coordinates[1]},${coordinates[2]}`);
  }

  const fallback = fallbackQuery.trim();
  if (fallback && GOOGLE_MAPS_SHORT_HOST.test(url.hostname)) {
    return googleMapsEmbedSearchUrl(fallback);
  }

  return "";
}
