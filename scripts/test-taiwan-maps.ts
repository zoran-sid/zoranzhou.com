import test from "node:test";
import assert from "node:assert/strict";
import { googleRoute, googlePlace } from "../src/lib/taiwan-maps";
import { taiwanPlans } from "../src/data/taiwan-trip";

test("route embeds retain the transport mode and full addresses from navigation", () => {
  const day = taiwanPlans[0].days[0];
  const walking = googleRoute(day.legs[1].url)!;
  const walkingUrl = new URL(walking.embedUrl);
  assert.equal(walkingUrl.searchParams.get("dirflg"), "w");
  assert.equal(
    walkingUrl.searchParams.get("daddr"),
    "台北市中正區開封街一段33號",
  );
  assert.equal(
    new URL(googleRoute(day.legs[0].url)!.embedUrl).searchParams.get("dirflg"),
    "r",
  );
  assert.equal(walkingUrl.searchParams.get("output"), "embed");
});

test("ticket pages, untyped previews and invalid URLs never become driving directions", () => {
  for (const url of [
    "invalid",
    "https://afrts.forest.gov.tw/",
    "https://example.com/maps/dir/?api=1&origin=A&destination=B&travelmode=walking",
    "https://www.google.com/maps/dir/?api=1&origin=A&destination=B",
    taiwanPlans[0].days[0].previewUrl,
  ]) {
    assert.equal(googleRoute(url), undefined);
  }
});

test("hotel map searches use verified addresses, not approximate planning coordinates", () => {
  const hotel = taiwanPlans[0].days[0].stops[2];
  assert.equal(
    new URL(googlePlace(hotel).embedUrl).searchParams.get("q"),
    "台北市中正區開封街一段33號",
  );
  const kaohsiung = taiwanPlans[0].days[7].stops[1];
  assert.equal(
    new URL(googlePlace(kaohsiung).url).searchParams.get("query"),
    "高雄市三民區建國二路295號",
  );
});

test("ferries are queried between the two piers, with separate walking legs", () => {
  for (const plan of taiwanPlans) {
    const day = plan.days.find((day) =>
      day.legs.some((leg) => leg.label.includes("查渡轮")),
    )!;
    const ferry = new URL(
      day.legs.find((leg) => leg.label.includes("查渡轮"))!.url,
    );
    assert.equal(ferry.searchParams.get("origin"), "鼓山輪渡站 高雄市");
    assert.equal(ferry.searchParams.get("destination"), "旗津輪渡站 高雄市");
    assert.equal(ferry.searchParams.get("travelmode"), "transit");
    assert.ok(
      day.legs.some(
        (leg) =>
          leg.label === "旗津码头 → 海岸步行" &&
          googleRoute(leg.url)?.mode === "walking",
      ),
    );
  }
});

test("both plans provide a real map query for each stop and supported modes for each route", () => {
  for (const plan of taiwanPlans)
    for (const day of plan.days) {
      for (const stop of day.stops) assert.ok(stop.mapQuery.trim());
      for (const leg of day.legs)
        if (leg.url.startsWith("https://www.google.com/maps/dir/?")) {
          assert.ok(
            googleRoute(leg.url),
            `${plan.id} D${day.id}: ${leg.label}`,
          );
        }
    }
  assert.equal(
    taiwanPlans[0].days[4].legs.filter((leg) => googleRoute(leg.url)).length,
    0,
  );
});
