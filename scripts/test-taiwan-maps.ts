import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { googleRoute, googlePlace } from "../src/lib/taiwan-maps";
import { taiwanPlans } from "../src/data/taiwan-trip";
import { taiwanFood } from "../src/data/taiwan-food";

const west = taiwanPlans.filter((plan) => plan.journey === "west");
const text = (value: unknown) => JSON.stringify(value);
const weekday = (date: string) =>
  new Date(`2026/${date} 12:00:00 GMT`).getUTCDay();

test("every journey/date combination has eight consecutive days and seven nights", () => {
  assert.equal(
    new Set(taiwanPlans.map((p) => `${p.journey}-${p.departure}`)).size,
    4,
  );
  for (const plan of taiwanPlans) {
    assert.equal(plan.days.length, 8);
    assert.match(plan.days[0].date, new RegExp(`12/${plan.departure}$`));
    assert.equal(plan.days.filter((d) => !d.stay.startsWith("返程")).length, 7);
    for (let i = 1; i < 8; i++)
      assert.equal(
        new Date(`2026/${plan.days[i].date} GMT`).getTime() -
          new Date(`2026/${plan.days[i - 1].date} GMT`).getTime(),
        86400000,
      );
  }
});

test("west route retains 4/2/1 nights and all requested Taipei experiences", () => {
  for (const plan of west) {
    for (const [city, nights] of [
      ["台北", 4],
      ["台南", 2],
      ["高雄", 1],
    ] as const)
      assert.equal(
        plan.days.filter((d) => d.stay.startsWith(city)).length,
        nights,
      );
    const names = plan.days
      .flatMap((d) => d.stops.map((s) => s.name))
      .join(" ");
    for (const name of [
      "故宫",
      "凤梨酥",
      "101",
      "国父纪念馆",
      "象山",
      "独立汤屋",
      "市场",
      "小潘",
      "龙虎塔",
    ])
      assert.ok(names.includes(name), `${plan.id}: ${name}`);
    assert.ok(!plan.days[4].stops.some((s) => /汤屋/.test(s.name)));
    assert.match(text(plan.days[4]), /高铁板桥/);
  }
});

test("Presidential Office is always on a weekday; Thermal Valley never on Monday", () => {
  for (const plan of taiwanPlans) {
    const office = plan.days.find((d) =>
      d.stops.some((s) => s.mapQuery.includes("總統府")),
    );
    assert.ok(office, plan.id);
    assert.ok(
      weekday(office.date) >= 1 && weekday(office.date) <= 5,
      `${plan.id}: ${office.date}`,
    );
    for (const d of plan.days)
      if (d.stops.some((s) => s.name === "地热谷"))
        assert.notEqual(weekday(d.date), 1);
  }
});

test("both journeys switch D6 night market automatically for Wednesday", () => {
  for (const plan of taiwanPlans) {
    const d6 = plan.days[5];
    if (weekday(d6.date) === 3) {
      assert.ok(d6.stops.some((s) => s.name.includes("武圣")));
      assert.ok(!d6.stops.some((s) => s.mapQuery.includes("大東")));
      assert.match(text(d6), /大东休市|大东.*今晚休市/);
    } else {
      assert.ok(d6.stops.some((s) => s.name.includes("大东")));
      assert.equal(weekday(d6.date), 2);
    }
  }
});

test("all stops have an approach and explicit priority without binding hotels", () => {
  assert.doesNotMatch(
    text(taiwanPlans),
    /天雲|天云|康桥|康橋|開封街一段33號|建國二路295號/,
  );
  for (const p of taiwanPlans)
    for (const d of p.days)
      for (const s of d.stops) {
        assert.ok(s.approach.trim());
        assert.ok(["core", "optional"].includes(s.priority));
        assert.equal(
          new URL(googlePlace(s).embedUrl).searchParams.get("q"),
          s.mapQuery,
        );
      }
});

test("route embeds keep public-transport/walking modes and exact named endpoints", () => {
  for (const plan of taiwanPlans)
    for (const day of plan.days)
      for (const leg of day.legs) {
        if (!leg.url.startsWith("https://www.google.com/maps/dir/?")) continue;
        const route = googleRoute(leg.url);
        assert.ok(route, `${plan.id} D${day.id}: ${leg.label}`);
        const external = new URL(leg.url),
          embed = new URL(route.embedUrl);
        assert.equal(
          embed.searchParams.get("saddr"),
          external.searchParams.get("origin"),
        );
        assert.equal(
          embed.searchParams.get("daddr"),
          external.searchParams.get("destination"),
        );
        assert.equal(
          embed.searchParams.get("dirflg"),
          route.mode === "walking" ? "w" : "r",
        );
      }
  for (const url of [
    "invalid",
    "https://example.com/maps/dir/?api=1&origin=A&destination=B&travelmode=walking",
    "https://www.google.com/maps/dir/?api=1&origin=A&destination=B",
    taiwanPlans[0].days[0].previewUrl,
  ])
    assert.equal(googleRoute(url), undefined);
});

test("Cijin ferry connects piers, with walking separately to the coast", () => {
  for (const plan of taiwanPlans) {
    const day = plan.days[6];
    const ferry = new URL(
      day.legs.find((l) => l.label.includes("查渡轮"))!.url,
    );
    assert.equal(ferry.searchParams.get("origin"), "鼓山輪渡站 高雄市");
    assert.equal(ferry.searchParams.get("destination"), "旗津輪渡站 高雄市");
    assert.equal(ferry.searchParams.get("travelmode"), "transit");
    assert.equal(
      googleRoute(day.legs.find((l) => l.label === "旗津码头 → 海岸步行")!.url)
        ?.mode,
      "walking",
    );
  }
});

test("west southbound transfer distinguishes HSR Tainan, Shalun, downtown station", () => {
  for (const plan of west) {
    const routes = plan.days[4].legs.map((l) => new URL(l.url));
    assert.ok(
      routes.some(
        (u) =>
          u.searchParams.get("origin") === "高鐵台南站" &&
          u.searchParams.get("destination") === "沙崙車站" &&
          u.searchParams.get("travelmode") === "walking",
      ),
    );
    assert.ok(
      routes.some(
        (u) =>
          u.searchParams.get("origin") === "沙崙車站" &&
          u.searchParams.get("destination") === "臺鐵臺南站",
      ),
    );
  }
});

test("all nineteen foods are distinct, filterable, and include required preparations", () => {
  assert.equal(taiwanFood.length, 19);
  assert.equal(new Set(taiwanFood.map((f) => f.id)).size, 19);
  for (const food of taiwanFood) assert.ok(food.areas.length);
  assert.match(
    taiwanFood.find((f) => f.id === "blood-cake")!.note,
    /加香菜与花生粉/,
  );
  assert.match(
    taiwanFood.find((f) => f.id === "bread")!.note,
    /葱花、肉松、菠萝/,
  );
  assert.match(
    taiwanFood.find((f) => f.id === "teppan")!.note,
    /高丽菜、豆芽菜/,
  );
});

test("east alternative preserves museum/workshop day and gates Blue train/airport detour", () => {
  for (const plan of taiwanPlans.filter((p) => p.journey === "east")) {
    assert.deepEqual(
      plan.days.slice(3, 7).map((d) => d.stay.split(" · ")[0]),
      ["花莲", "台东", "台南", "高雄"],
    );
    for (const term of ["故宫", "DIY"])
      assert.ok(
        plan.days[2].stops.some(
          (s) => s.name.includes(term) && s.priority === "core",
        ),
      );
    assert.match(plan.days[5].note, /默认上午搭台铁南回线常规班次/);
    assert.match(text(plan.days[5].sections), /通常安排在午后/);
    assert.match(text(plan.days[7].sections), /晚班机/);
    assert.match(text(plan.days[7].sections), /去回两班/);
  }
});

test("article ends at interactive planner; no duplicate itinerary below D8", () => {
  const article = readFileSync(
    new URL("../src/content/blog/taiwan-seven-days-2026.mdx", import.meta.url),
    "utf8",
  );
  assert.ok(article.trimEnd().endsWith("<TaiwanTripPlanner />"));
  assert.doesNotMatch(article, /八天怎么走，先把重点留住|## D[1-8]/);
  const component = readFileSync(
    new URL("../src/components/TaiwanTripPlanner.astro", import.meta.url),
    "utf8",
  );
  assert.ok(
    component.indexOf("data-shared-budget") <
      component.indexOf('class="tw-map-column"'),
  );
});

test("arrival only settles in and browses Ningxia, without Dihua/temple detours", () => {
  for (const p of taiwanPlans) {
    const d = p.days[0];
    assert.equal(d.stops.length, 3);
    assert.match(d.stops[2].name, /宁夏/);
    assert.ok(!d.stops.some((s) => /迪化|城隍|码头/.test(s.name)));
  }
});
test("north outing uses a budget afternoon bath before Tamsui, without Longshan", () => {
  for (const p of west) {
    const museum = p.days.find((d) =>
      d.stops.some((s) => s.name.includes("故宫")),
    )!;
    assert.notEqual(weekday(museum.date), 1);
    const north = p.days.find((d) =>
      d.stops.some((s) => s.name.includes("瀧乃汤")),
    )!;
    assert.equal(north.id, p.departure === "10" ? 3 : 4);
    assert.doesNotMatch(text(north), /龙山|龙门|龍山|丽禧|麗禧|幽雅路/);
    const bath = north.stops.findIndex((s) => s.name.includes("瀧乃汤"));
    const tamsui = north.stops.findIndex((s) => s.name.includes("文化阿给"));
    assert.ok(bath >= 0 && bath < tamsui);
    assert.match(north.stops[bath].detail, /400.*两人.*60分钟/);
    assert.match(north.stops[bath].period, /午后/);
    assert.match(
      north.stops.find((s) => s.name.includes("双连"))!.mapQuery,
      /民生西路45巷/,
    );
    assert.match(north.stops[tamsui].mapQuery, /中正路138號/);
    assert.ok(north.legs.some((l) => /新北投.*淡水站/.test(l.label)));
    assert.ok(north.stops.some((s) => /夜逛/.test(s.name)));
    const d2 = p.days[1];
    const idx = (n: string) => d2.stops.findIndex((s) => s.name.includes(n));
    assert.ok(idx("101登顶") < idx("虎林"));
    assert.ok(idx("虎林") < idx("象山"));
    assert.ok(idx("象山") < idx("竹村"));
    assert.equal(d2.stops[idx("象山")].priority, "optional");
  }
});
test("museum/workshop days continue to Raohe, riverside and optional nightlife", () => {
  for (const p of taiwanPlans) {
    const d = p.days.find((d) => d.stops.some((s) => s.name.includes("故宫")))!;
    const idx = (n: string) => d.stops.findIndex((s) => s.name.includes(n));
    assert.ok(idx("DIY") < idx("饶河街"));
    assert.ok(idx("饶河街") < idx("彩虹桥"));
    assert.ok(idx("中山街区夜逛") >= 0);
    assert.ok(idx("士林夜市") >= 0);
    assert.ok(d.legs.some((l) => /郭元益.*饶河/.test(l.label)));
    assert.doesNotMatch(d.culture.body, /吃顿饭.*收尾/);
  }
});
test("Kaohsiung dinner is a candidate outdoor reservation, not a claimed booking", () => {
  for (const p of taiwanPlans) {
    const d = p.days[6];
    const dinner = d.stops.find((s) => s.name.includes("永心浮岛"))!;
    assert.match(dinner.detail, /尚未订位/);
    assert.match(dinner.detail, /户外港景/);
    assert.ok(d.legs.some((l) => /官方菜单与订位/.test(l.label)));
  }
});

test("Acai is explicitly scheduled once per plan and avoids uncertain Wednesday service", () => {
  for (const p of taiwanPlans) {
    const days = p.days.filter((d) =>
      d.stops.some((s) => s.name.includes("阿财")),
    );
    assert.equal(days.length, 1);
    assert.notEqual(weekday(days[0].date), 3);
    assert.match(
      days[0].stops.find((s) => s.name.includes("阿财"))!.mapQuery,
      /古堡街5號/,
    );
    assert.ok(days[0].legs.some((l) => l.label.includes("阿财")));
  }
  assert.ok(west[0].days[5].stops.some((s) => s.name.includes("阿财")));
  assert.ok(west[1].days[4].stops.some((s) => s.name.includes("阿财")));
});
