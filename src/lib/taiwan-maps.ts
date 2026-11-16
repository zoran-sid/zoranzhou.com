import type { TaiwanStop } from "../data/taiwan-trip";

// Use Google's public, embeddable Maps view. Directions remain provider-computed;
// the planner never constructs road, walking or transit geometry from point pairs.
const mapHost = "https://maps.google.com/maps";
export function googleRoute(url: string) {
  let source: URL;
  try {
    source = new URL(url);
  } catch {
    return undefined;
  }
  if (
    source.origin !== "https://www.google.com" ||
    source.pathname !== "/maps/dir/" ||
    source.searchParams.get("api") !== "1"
  )
    return undefined;
  const origin = source.searchParams.get("origin");
  const destination = source.searchParams.get("destination");
  const mode = source.searchParams.get("travelmode");
  const flags: Record<string, string> = {
    walking: "w",
    transit: "r",
    driving: "d",
  };
  if (
    !origin ||
    !destination ||
    !mode ||
    !flags[mode] ||
    source.searchParams.has("waypoints")
  )
    return undefined;
  const embed = new URL(mapHost);
  embed.search = new URLSearchParams({
    saddr: origin,
    daddr: destination,
    dirflg: flags[mode],
    output: "embed",
    hl: "zh-TW",
  }).toString();
  return {
    embedUrl: embed.href,
    url: source.href,
    mode,
    label:
      { walking: "步行", transit: "公共交通", driving: "驾车" }[mode] ?? mode,
  };
}
export function googlePlace(stop: TaiwanStop) {
  const query = stop.mapQuery;
  const embed = new URL(mapHost);
  embed.search = new URLSearchParams({
    q: query,
    output: "embed",
    hl: "zh-TW",
  }).toString();
  const external = new URL("https://www.google.com/maps/search/");
  external.search = new URLSearchParams({ api: "1", query }).toString();
  return { embedUrl: embed.href, url: external.href };
}
