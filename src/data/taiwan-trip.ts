export interface TaiwanStop {
  name: string;
  mapQuery: string;
  kind: string;
  detail: string;
  period: string;
  priority: "core" | "optional";
  approach: string;
}
export interface TaiwanSection {
  title: string;
  paragraphs: string[];
  links?: { label: string; url: string }[];
  collapsible?: boolean;
}
export interface TaiwanDay {
  id: number;
  date: string;
  base: string;
  name: string;
  route: string;
  note: string;
  stops: TaiwanStop[];
  previewUrl: string;
  legs: { label: string; url: string }[];
  culture: {
    title: string;
    body: string;
    source: { title: string; url: string };
  };
  sections: TaiwanSection[];
  stay: string;
  pace: string;
}
export interface TaiwanPlan {
  id: string;
  journey: "west" | "east";
  departure: "10" | "11";
  label: string;
  range: string;
  nights: string;
  summary: string;
  days: TaiwanDay[];
  budget: { flight: number; hotel: number; food: number };
}
// Planning estimates per person. No hotel or flight has been booked.
export const TAIWAN_BUDGET_RESERVE = 8000;
const place = {
  airport: "桃園國際機場",
  a1: "桃園機場捷運 A1台北車站",
  taipei: "臺北車站",
  zhongshan: "捷運中山站 臺北市",
  market: "東三水街市場 臺北市萬華區三水街",
  longshan: "艋舺龍山寺 臺北市廣州街211號",
  office: "總統府三號門 寶慶路 博愛路 臺北市",
  ximen: "西門紅樓 臺北市成都路10號",
  cks: "中正紀念堂 臺北市",
  dihua: "迪化街一段 臺北市大同區",
  xiahai: "台北霞海城隍廟 臺北市迪化街一段61號",
  wharf: "大稻埕碼頭 臺北市",
  ningxia: "寧夏夜市 臺北市",
  raohe: "饒河街觀光夜市 臺北市",
  museum: "國立故宮博物院 臺北市士林區至善路二段221號",
  shilin: "捷運士林站 臺北市",
  diy: "郭元益糕餅博物館 士林館 臺北市文林路546號4樓",
  memorial: "國父紀念館 臺北市仁愛路四段505號",
  tower: "台北101觀景台 臺北市信義路五段7號",
  hill: "象山步道 靈雲宮登山口 臺北市信義區信義路五段150巷",
  beitou: "捷運新北投站 臺北市",
  bath: "瀧乃湯 臺北市北投區光明路244號",
  valley: "北投地熱谷 臺北市",
  sulfur: "硫磺谷遊憩區 臺北市北投區",
  banqiao: "板橋車站 新北市",
  bakery: "小潘蛋糕坊 中正店 新北市板橋區中正路135巷11之1號",
  hsrBanqiao: "高鐵板橋站",
  hsrTainan: "高鐵台南站",
  shalun: "沙崙車站",
  tainan: "臺鐵臺南站",
  oldtown: "赤崁樓 臺南市中西區",
  temple: "鹽埕天后宮 臺南市南區鹽埕路291巷15號",
  dadong: "大東夜市 臺南市東區林森路一段276號",
  dadongdong: "大東東夜市 臺南市東區林森路一段",
  wusheng: "武聖夜市 臺南市中西區武聖路69巷42號",
  tree: "安平樹屋 臺南市安平區古堡街108號",
  fort: "安平古堡 臺南市安平區國勝路82號",
  anping: "安平老街 延平街 臺南市",
  confucius: "臺南孔廟 臺南市中西區南門路2號",
  fuzhong: "府中街 臺南市中西區",
  art: "臺南國家美術館籌備處 臺南市中西區忠義路二段1號",
  guohua: "國華街三段 永樂市場 臺南市",
  shennong: "神農街 海安路口 臺南市",
  zuoying: "新左營車站 高鐵左營站 高雄市",
  dragon: "蓮池潭龍虎塔 高雄市左營區蓮潭路9號",
  spring: "蓮池潭春秋閣 高雄市",
  formosa: "捷運美麗島站 高雄市",
  pier2: "駁二藝術特區 高雄市",
  hamasen: "哈瑪星 高雄市",
  sizihwan: "西子灣觀景平台 高雄市",
  gushan: "鼓山輪渡站 高雄市",
  cijin: "旗津輪渡站 高雄市",
  beach: "旗津海岸公園 高雄市",
  khh: "高雄國際機場",
  toucheng: "頭城車站 宜蘭縣",
  waiao: "外澳車站 宜蘭縣",
  waiaoBeach: "外澳沙灘 宜蘭縣",
  hualien: "花蓮車站",
  qixingtan: "七星潭 花蓮縣",
  hualienCity: "東大門夜市 花蓮市",
  taitung: "臺東車站",
  tiehua: "臺東鐵道藝術村 鐵花商圈",
  taitungCoast: "臺東海濱公園",
  fangliao: "枋寮車站",
  taimali: "太麻里車站",
  kaohsiung: "高雄車站",
};
type P = keyof typeof place;
const nav = (
  label: string,
  from: P,
  to: P,
  mode: "walking" | "transit" = "transit",
) => ({
  label,
  url: `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", origin: place[from], destination: place[to], travelmode: mode })}`,
});
const link = (label: string, url: string) => ({ label, url });
const sources = {
  president: "https://www.president.gov.tw/Page/124",
  diy: "https://www.kuos.com/zh-TW/pages/pineapple-cake-diy-introduction",
  palace: "https://www.npm.gov.tw/",
  memorial: "https://www.travel.taipei/zh-tw/attraction/details/24",
  hill: "https://www.gov.taipei/News_Content.aspx?n=D0042A87C2F0270A&s=8826D23D548E4171",
  bath: "https://www.longnice.com.tw/modules/cadch/room",
  valley:
    "https://www.water.gov.taipei/News_Content.aspx?n=20FD034365D9809C&s=CA22DFCC722E6905&sms=87415A8B9CE81B16",
  bakery: "https://www.facebook.com/ThePansCake/",
  festival:
    "https://maygoddejia.com.tw/tainan-yancheng-tianhou-temple-jiao-2026-route/",
  temple: "https://www.twtainan.net/zh-tw/attractions/detail/987/",
  art: "https://tainanbiennial.org/venues/",
  night:
    "https://data.tainan.gov.tw/Resource/611e74b4-d09a-4712-b421-aa062fd02854",
  lotus: "https://khh.travel/zh-tw/attractions/detail/11/",
  tra: "https://www.railway.gov.tw/tra-tip-web/tip",
  blue: "https://event.liontravel.com/zh-tw/railtour/breezyblue/products",
  weather: "https://climate.cwa.gov.tw/SeasonalClimate?subpage=Winter",
  ferry: "https://kcs.kcg.gov.tw/",
  hsr: "https://www.thsrc.com.tw/",
};
function stop(
  key: P,
  name: string,
  period: string,
  kind: string,
  detail: string,
  approach: string,
  optional = false,
): TaiwanStop {
  return {
    name,
    mapQuery: place[key],
    period,
    kind,
    detail,
    approach,
    priority: optional ? "optional" : "core",
  };
}
function section(
  title: string,
  paragraphs: string[],
  links?: TaiwanSection["links"],
  collapsible = false,
): TaiwanSection {
  return { title, paragraphs, links, collapsible };
}
function culture(
  title: string,
  body: string,
  sourceTitle: string,
  url: string,
): TaiwanDay["culture"] {
  return { title, body, source: { title: sourceTitle, url } };
}
function day(
  id: number,
  start: number,
  base: string,
  name: string,
  note: string,
  stops: TaiwanStop[],
  legs: TaiwanDay["legs"],
  stay: string,
  sections: TaiwanSection[],
  local: TaiwanDay["culture"],
): TaiwanDay {
  const date = new Date(Date.UTC(2026, 11, start + id - 1));
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    date.getUTCDay()
  ];
  return {
    id,
    date: `12/${date.getUTCDate()}`,
    base,
    name,
    note,
    stops,
    legs,
    stay,
    sections,
    culture: local,
    pace: weekday,
    route: stops.map((s) => s.name).join(" → "),
    previewUrl: `https://www.google.com/maps/dir/${stops.map((s) => encodeURIComponent(s.mapQuery)).join("/")}/`,
  };
}
const dadi = () => [
  stop(
    "dihua",
    "迪化街南段",
    "午后／抵达较早时",
    "老街",
    "从南北货、布行和药材铺看老城生活。第一晚若已天黑，留到老城日再来。",
    "从台北车站或中山站周边前往迪化街一段南端，再沿街向北慢走。",
    true,
  ),
  stop(
    "xiahai",
    "台北霞海城隍庙",
    "散步途中",
    "信仰",
    "看街屋与庙口往来，跟随现场参拜动线。",
    "沿迪化街一段走到61号庙口；小街人多，停下来拍照时让出门口。",
    true,
  ),
  stop(
    "wharf",
    "大稻埕码头",
    "傍晚／赶得上日落时",
    "河岸",
    "天气好就到河边坐一会儿。冬季天黑早，晚班抵达直接删掉这一站。",
    "从迪化街向西往民生西路方向，按导航经水门进入河岸；遇施工改走开放入口。",
    true,
  ),
  stop(
    "ningxia",
    "宁夏夜市",
    "晚餐",
    "小吃",
    "选两三样分着吃，排队太长就换一摊。它在迪化街生活圈的东侧，适合散步后收尾。",
    "从码头或迪化街向东回宁夏路；吃完按台北车站／中山站方向返程。",
    true,
  ),
];
const arrival = (start: number) =>
  day(
    1,
    start,
    "香港 → 台北",
    "D1 香港 → 台北",
    "今天先安顿。抵达早、行李放好后还有精神，再走大稻埕；傍晚或夜间落地，附近吃饭就够了。",
    [
      stop(
        "airport",
        "桃园机场 → A1 台北车站",
        "抵达后",
        "入境与换乘",
        "办入境、取行李，再按航厦标识去机场捷运。直达车与普通车停站不同，买票时看清终点。",
        "跟随机场捷运指示进站，搭往台北方向至A1。机场捷运A1与台铁／高铁台北站不是同一处站厅，出站后按实际住宿地址选出口。",
      ),
      stop(
        "taipei",
        "台北车站／中山站周边安顿",
        "抵达后",
        "住宿参考区",
        "台北连住四晚，订房后把这一参考点换成实际地址；先放行李再散步。",
        "住台北车站周边可从A1步行接续；住中山一带则依地址步行或转捷运，不预设某个酒店出口。",
      ),
      ...dadi(),
    ],
    [
      nav("桃园机场 → A1 机场捷运", "airport", "a1"),
      nav("A1 → 台北车站周边步行", "a1", "taipei", "walking"),
      nav("台北车站 → 中山站周边", "taipei", "zhongshan", "walking"),
      nav("台北车站 → 迪化街南段", "taipei", "dihua", "walking"),
      nav("迪化街 → 霞海城隍庙", "dihua", "xiahai", "walking"),
      nav("霞海城隍庙 → 大稻埕码头", "xiahai", "wharf", "walking"),
      nav("码头 → 宁夏夜市", "wharf", "ningxia", "walking"),
      nav("宁夏夜市 → 中山站", "ningxia", "zhongshan", "walking"),
    ],
    "台北 · 第1晚（车站／中山周边待选）",
    [
      section(
        "先订哪些，哪些可以到了再说",
        [
          "两人同行，台北有朋友陪同。先确认香港至桃园、高雄返港航班，再订同一区域连住的房间、郭元益手作课和101门票。三座城市的酒店都还没定，导航统一用车站或街区作为参考。",
          "日期均为2026年。主方案12/10—12/17，备选12/11—12/18；切换日期后，总统府会移到工作日上午，台南夜市也随星期更换。一般景点只分上午、午后和傍晚。",
          "选了顺路可选的支线，就给它留时间。每天把核心体验走完，剩下的看天气和脚力；当天导航列表也包含支线，按实际选择打开对应的一段。",
        ],
        [
          link("台湾高铁订票", sources.hsr),
          link("台铁时刻与订票", sources.tra),
        ],
        true,
      ),
    ],
    culture(
      "从吃饭开始认识台北",
      "市场、寺庙和南北货街都有人在过日子。店铺开着就进去看看，摊位忙时站旁边等一会儿。第一晚不用把清单吃完。",
      "台北旅游网 · 宁夏夜市",
      "https://www.travel.taipei/en/attraction/details/1689/",
    ),
  );

const oldCity = (id: number, start: number) =>
  day(
    id,
    start,
    "台北 · 万华／大稻埕",
    `D${id} 台北 · 早市、龙山寺与老城`,
    "上午留给早市、龙山寺和总统府。总统府有入场窗口，先守住这一项；午后大稻埕与中正纪念堂二选一，或回住处休息。",
    [
      stop(
        "market",
        "东三水早市",
        "上午",
        "市井早餐",
        "早点到能看见较完整的出摊。吃润饼、面线或买一份熟食，两个人分着尝。",
        "从台北车站搭板南线到龙山寺站，再按三水街方向步行入市场。东三水与旁边的新富市场是不同场所，摊位营业各自为准。",
      ),
      stop(
        "longshan",
        "艋舺龙山寺",
        "上午",
        "信仰与建筑",
        "沿参拜动线看屋脊、雕刻和庙埕，留意正在礼拜的人。",
        "从三水街走向广州街，至龙山寺正面入口；离开后前往总统府三号门。",
      ),
      stop(
        "office",
        "总统府三号门",
        "工作日上午",
        "有开放窗口",
        "一般开放日09:00—12:00，11:30最后入府；少于15人个人参观通常无需预约，带有照片的身份证件。临时活动会调整开放。",
        "从龙山寺搭捷运到西门站再步行，或依体力步行过去。认宝庆路与博爱路口的三号门，现场安检入内。",
      ),
      stop(
        "ximen",
        "西门町／西门红楼周边",
        "午餐与休息",
        "顺路短逛",
        "参观后往西门方向吃午餐、喝杯东西。红楼展馆按当天开放，街区可短走。",
        "从三号门沿宝庆路向西走，过中华路路口到西门红楼周边；过街走人行道和斑马线。",
        true,
      ),
      ...dadi(),
      stop(
        "cks",
        "中正纪念堂",
        "午后替换项",
        "建筑与广场",
        "若更想看纪念性建筑，就用这里替换大稻埕下午。",
        "从西门搭捷运或公交至中正纪念堂站，逛完就近回程，不再横穿市区追另一组景点。",
        true,
      ),
    ],
    [
      nav("台北车站 → 东三水市场", "taipei", "market"),
      nav("东三水 → 龙山寺", "market", "longshan", "walking"),
      nav("龙山寺 → 总统府三号门", "longshan", "office"),
      link("总统府开放与证件要求", sources.president),
      nav("三号门 → 西门红楼周边", "office", "ximen", "walking"),
      nav("西门 → 迪化街南段", "ximen", "dihua"),
      nav("迪化街 → 霞海城隍庙", "dihua", "xiahai", "walking"),
      nav("霞海城隍庙 → 大稻埕码头", "xiahai", "wharf", "walking"),
      nav("码头 → 宁夏夜市", "wharf", "ningxia", "walking"),
      nav("西门 → 中正纪念堂（替换）", "ximen", "cks"),
    ],
    `台北 · 第${id}晚`,
    [
      section(
        "午后留一组就好",
        [
          "大稻埕若已在第一晚走过，今天可以只逛南北货店、补一份豆花，或改去中正纪念堂。想让朋友带着吃饭，就把下午交给朋友。饶河夜市另留在信义区那天作为晚餐替换项。",
        ],
        undefined,
        true,
      ),
    ],
    culture(
      "庙口与早市",
      "这里的重点是早餐、买菜、参拜和街屋之间的日常联系。入庙放低音量，不从正在参拜的人前面穿过；市场拍摊主先征求同意。",
      "总统府 · 参观须知",
      sources.president,
    ),
  );

const museumDay = (id: number, start: number) =>
  day(
    id,
    start,
    "台北 · 士林",
    `D${id} 台北 · 故宫与凤梨酥手作`,
    "故宫与郭元益各留半天，按预约课时决定先后。今天两项就是主线，晚饭留在士林或回中山附近。",
    [
      stop(
        "museum",
        "国立故宫博物院",
        "上午／依课程调整",
        "核心看展",
        "挑几个真正想看的展厅慢慢看。热门文物轮换展出，出发前查当期展览，不把某一件文物当成必定能见。",
        "从台北车站或中山搭淡水信义线到士林站，再转往故宫的公交；认至善路二段221号北部院区。",
      ),
      stop(
        "shilin",
        "士林午餐与休息",
        "午间",
        "换乘街区",
        "故宫与手作之间吃午饭、休息，课前留出报到余量。",
        "从故宫返回士林站周边，按课程订单确认报到地点，再去文林路。",
        true,
      ),
      stop(
        "diy",
        "郭元益凤梨酥 DIY · 士林馆",
        "预约时段",
        "需要预约",
        "文林路546号4楼。两位参与者按课程规则各自订位；课程日期、时长和报到要求以订单为准。自己做的留一份带走。",
        "从士林站周边沿文林路前往546号，认郭元益糕饼博物馆士林馆，再按现场指示上楼。它与故宫同在士林区，仍需搭车接驳。",
      ),
    ],
    [
      nav("中山站 → 故宫北部院区", "zhongshan", "museum"),
      nav("故宫 → 士林站午餐", "museum", "shilin"),
      nav("士林站 → 郭元益士林馆", "shilin", "diy", "walking"),
      nav("郭元益 → 中山站周边", "diy", "zhongshan"),
      link("故宫展览与参观", sources.palace),
      link("郭元益 DIY 课程与预约", sources.diy),
    ],
    `台北 · 第${id}晚`,
    [
      section(
        "小潘也能提前买",
        [
          "若南下日不想多一次搬运行李，可以在D2—D4的空档去板桥小潘。先查中正店当天营业与库存，再决定是否从蓝线沿线过去。买完回台北，今天就不再增加夜市。裸装与独立包装保存方式不同，按店家标签安排食用与携带。",
        ],
        [
          nav("台北车站 → 板桥站（采购备选）", "taipei", "banqiao"),
          nav("板桥站 → 小潘中正店", "banqiao", "bakery", "walking"),
          link("小潘店家公告", sources.bakery),
        ],
        true,
      ),
    ],
    culture(
      "做一份带走的点心",
      "手作课让伴手礼多了一道亲手完成的工序。故宫看展和揉面都需要精神，课程结束以后吃顿饭，今天就可以收尾了。",
      "郭元益 · 凤梨酥手作介绍",
      sources.diy,
    ),
  );

const skyline = (id: number, start: number) =>
  day(
    id,
    start,
    "台北 · 信义／松山",
    `D${id} 台北 · 国父园区、101与象山`,
    "今天集中在信义区。101登顶与国父纪念馆园区保留，象山按开放路径与天气决定走到哪里；晚餐只选一处。",
    [
      stop(
        "memorial",
        "国父纪念馆园区与建筑外观",
        "上午",
        "园区散步",
        "馆体整修中，先按开放的园区与建筑外观安排；能否入馆看最新公告。",
        "从台北车站／中山周边转板南线至国父纪念馆站，按开放入口进入园区，遇围挡沿外围步行。",
      ),
      stop(
        "tower",
        "台北101登顶 · 观景台",
        "午后／预约时段",
        "高处看城市",
        "这里的登顶指持票上观景台。选票种时看清可到楼层；户外层与额外体验依天气及票种开放。",
        "从纪念馆园区往信义商圈步行，或搭车到台北101／世贸站，按观景台售票与电梯指示报到。",
      ),
      stop(
        "hill",
        "象山步道 · 灵云宫入口",
        "午后至傍晚",
        "核心户外体验",
        "想看101和山城的关系，就走一段开放步道。部分路段施工计划至2027年4月，按公告折返；雨天台阶湿滑，改留信义商圈。",
        "从101往象山站、信义路五段150巷方向走，到灵云宫入口；只沿开放路径上行，原路或依现场标示下山，不翻越围挡。",
      ),
      stop(
        "raohe",
        "饶河夜市",
        "晚餐替换项",
        "夜市",
        "两人分一份胡椒饼，再选面线、香肠或热甜品。爬山后累了就信义附近吃饭，饶河可删。",
        "从象山／信义区搭车至松山站，按慈祐宫方向走到夜市入口；吃完可搭松山新店线回中山站。",
        true,
      ),
    ],
    [
      nav("台北车站 → 国父纪念馆园区", "taipei", "memorial"),
      nav("国父纪念馆 → 101", "memorial", "tower", "walking"),
      nav("101 → 象山灵云宫入口", "tower", "hill", "walking"),
      nav("象山入口 → 饶河夜市（可选）", "hill", "raohe"),
      nav("饶河 → 中山站", "raohe", "zhongshan"),
      link("纪念馆开放状态", sources.memorial),
      link("象山施工与开放路径公告", sources.hill),
      link("101观景台票种", "https://www.taipei-101.com.tw/"),
    ],
    `台北 · 第${id}晚`,
    [],
    culture(
      "天气决定看多远",
      "101适合看城市的尺度，象山适合看山坡与楼群。天空灰的时候也能逛，但能见度影响远景；两处不必都卡日落。",
      "台北市政府 · 象山工程公告",
      sources.hill,
    ),
  );

const festivalSection = () =>
  section(
    "盐埕天后宫 · 五朝建醮",
    [
      "这次台南想留一点时间给真实发生的民俗活动。地点在台南市南区盐埕路291巷15号，别与高雄盐埕区混淆。今晚精神够就去，或留到明天傍晚，约留1—1.5小时看醮坛、牌楼与公开科仪。",
      "这是一场十二年一科的庆成祈安建醮。科仪表的公开转载列12/12为庆成谢土等前置活动，12/14起鼓，五朝清醮延续至12/18；两种日期都会遇上12/14—12/18这段核心科仪，具体公开时段仍看庙方当日公告。",
      "旁观时站在工作人员指引的区域，给参拜、道士团与供桌留出空间。清醮期间的供品与饮食习俗遵循现场要求，拍摄先询问，不默认每个时段都有可观看的节目。",
    ],
    [
      link("庙宇地点 · 台南旅游网", sources.temple),
      link("科仪日期表转载 · 出发前向庙方复核", sources.festival),
    ],
  );
const nightSection = (start: number, id: number) => {
  const wed = new Date(Date.UTC(2026, 11, start + id - 1)).getUTCDay() === 3;
  return section(
    wed ? "今晚周三：改去武圣夜市" : "今晚去大东／大东东夜市",
    [
      wed
        ? "这组日期的台南第二晚是12/16周三。大东与相邻的大东东常规营业为周一、二、五，今晚休市，改去周三营业的武圣夜市。"
        : "大东与相邻的大东东在周一、二、五营业。主方案12/14周一和12/15周二都适用；第二晚只选一片摊区慢慢吃，不必两边全部走完。",
      "晚餐从一份主食、一道炸物和一份甜品开始。建醮与夜市同晚都想去，就缩短白天可选古迹；走累了可在中西区吃晚饭收尾。临时停业、雨天与活动调整看当天公告。",
    ],
    [
      nav(
        wed ? "中西区 → 武圣夜市" : "中西区 → 大东夜市",
        "oldtown",
        wed ? "wusheng" : "dadong",
      ),
      ...(wed
        ? []
        : [nav("大东 → 相邻大东东步行", "dadong", "dadongdong", "walking")]),
      link("台南市夜市营业日资料", sources.night),
    ],
  );
};
const beitou = (start: number) =>
  day(
    5,
    start,
    "台北 → 台南",
    "D5 北投泡汤 → 板桥 → 台南",
    "上午把泡汤留住，午后南下。小潘采购是顺路可选，开店、寄物与高铁衔接都合适才加；到台南后先放行李，庙会看精神再去。",
    [
      stop(
        "beitou",
        "新北投与独立汤屋",
        "上午／预约时段",
        "两人泡汤",
        "独立汤屋按两人预约。瀧乃汤可作候选，上午受理方式、时长与价格先向店家确认；订不到就换能预约的汤屋。",
        "从台北车站／中山搭淡水信义线到北投，转支线至新北投，再沿光明路往汤屋。大箱留在台北住宿处，出发前确认退房后寄存。",
      ),
      ...(start === 10
        ? [
            stop(
              "sulfur",
              "硫磺谷地景",
              "泡汤前后替换项",
              "火山地景",
              "今天周一，地热谷休园；想看地景可另搭车去硫磺谷观景，不叠加园区所有项目。",
              "从新北投另搭公交或计程车前往硫磺谷。看完回新北投再返市区；时间紧就只泡汤。",
              true,
            ),
          ]
        : [
            stop(
              "valley",
              "地热谷",
              "泡汤前后",
              "火山地景",
              "今天周二，按开放情况走一段地热谷步道；若临时关闭就略过。",
              "从光明路汤屋区往地热谷开放入口步行，环看后回新北投搭车。",
              true,
            ),
          ]),
      stop(
        "taipei",
        "回台北参考街区取行李",
        "午后",
        "取箱与换乘",
        "吃点东西、拿齐行李，再决定板桥采购是否仍合适。",
        "原路返回实际住宿处取箱；以下导航从台北车站出发，订房后替换这一段起点。",
      ),
      stop(
        "banqiao",
        "板桥站寄物 → 小潘中正店",
        "午后可选",
        "伴手礼",
        "先查营业与排队情况，再找站内寄物柜；柜满则换有人寄存服务或直接取消采购。小潘中正店为中正路135巷11之1号。",
        "从台北车站搭台铁／捷运至板桥站，放好大箱再走或搭车去中正路135巷；进入巷口后按11之1号找店，不把行李拖进小巷。",
        true,
      ),
      stop(
        "bakery",
        "小潘凤梨酥、凤凰酥与面包",
        "采购可选",
        "台式烘焙",
        "按当天供应买裸装凤凰酥／凤梨酥及面包，想买的卖完就换别款。网上营业时间有冲突，不能预设周一或周二一定开；出发前查店家公告，必要时提前到D2—D4。",
        "在店内挑好后回板桥站取箱，从同一车站换乘高铁，采购袋收好放在随身行李里。",
        true,
      ),
      stop(
        "hsrBanqiao",
        "高铁板桥站 → 高铁台南站",
        "午后",
        "跨城",
        "采购顺利就从板桥南下；取消板桥采购时可直接从台北高铁站出发。按当天实际进度订有换乘余量的车。",
        "板桥台铁、捷运与高铁共构，取箱后跟随高铁标识进站。高铁台南站在沙仑，不是台南市中心。",
      ),
      stop(
        "tainan",
        "沙仑线 → 台南站／中西区",
        "傍晚",
        "到城与安顿",
        "高铁台南站步行至台铁沙仑站，转区间车到台南站，再去中西区住宿。今晚先办入住、吃饭。",
        "沿高铁站二楼连通道到沙仑车站，认台南方向班次；到台南站后按实际住宿地址步行、搭公交或计程车。",
      ),
      stop(
        "temple",
        "南区盐埕天后宫",
        "傍晚／也可明晚",
        "民俗体验",
        "留1—1.5小时看公开的建醮场景。晚到或累了就移到D6，住宿连住两晚有余地。",
        "从中西区先放行李，再搭公交或计程车到盐埕路291巷附近，最后步行入巷；认台南南区盐埕天后宫。",
        true,
      ),
    ],
    [
      nav("台北车站 → 新北投站", "taipei", "beitou"),
      nav("新北投站 → 汤屋候选瀧乃汤", "beitou", "bath", "walking"),
      nav(
        start === 10 ? "新北投 → 硫磺谷（可选）" : "汤屋区 → 地热谷（可选）",
        start === 10 ? "beitou" : "bath",
        start === 10 ? "sulfur" : "valley",
        start === 10 ? "transit" : "walking",
      ),
      nav("新北投 → 台北车站取箱参考", "beitou", "taipei"),
      nav("台北车站 → 板桥站", "taipei", "banqiao"),
      nav("板桥站 → 小潘中正店", "banqiao", "bakery", "walking"),
      nav("小潘 → 高铁板桥站取箱乘车", "bakery", "hsrBanqiao", "walking"),
      nav("高铁板桥 → 高铁台南", "hsrBanqiao", "hsrTainan"),
      nav("高铁台南 → 沙仑站步行", "hsrTainan", "shalun", "walking"),
      nav("沙仑 → 台铁台南站", "shalun", "tainan"),
      nav("台南站 → 中西区参考点", "tainan", "oldtown"),
      nav("中西区 → 南区盐埕天后宫", "oldtown", "temple"),
      nav("盐埕天后宫 → 中西区", "temple", "oldtown"),
    ],
    "台南 · 第1晚（中西区待选）",
    [
      section(
        "泡汤和采购的取舍",
        [
          "今天保留泡汤与南下两件事。若小潘营业未确认、寄物柜满、采购队伍长，就直接搭高铁；把钱和体力留给台南。汤屋是体验地点，不代表已订台北住宿。",
        ],
        [
          link("汤屋候选与店家规则", sources.bath),
          link("地热谷周一休园公告", sources.valley),
          link("小潘店家公告", sources.bakery),
        ],
        true,
      ),
      festivalSection(),
      section(
        "今晚吃什么",
        [
          "主方案今晚周一、备选方案今晚周二，大东夜市均属常规营业日。若已去庙会，选附近晚饭或中西区面店就够；大东可留明晚，备选日期明晚改武圣。",
        ],
        [nav("中西区 → 大东夜市（有余力再去）", "oldtown", "dadong")],
        true,
      ),
    ],
    culture(
      "先安顿，再看醮坛",
      "庙会在南区，古迹与住宿参考区在中西区。两者需要搭车接续；把大箱放下再出门，会轻松很多。",
      "台南旅游网 · 盐埕天后宫",
      sources.temple,
    ),
  );

const tainanDay = (start: number) =>
  day(
    6,
    start,
    "台南 · 安平／中西区",
    "D6 台南 · 安平、旧城与建醮",
    "上午在安平慢走，午后回中西区只挑一两处。庙会若昨晚看过，今晚留给晚饭；夜市按当前日期自动换场。",
    [
      stop(
        "tree",
        "安平树屋",
        "上午",
        "历史与自然",
        "先看榕树与旧仓库交织的空间。树屋、古堡和老街相邻，上午只走这一片。",
        "从中西区搭公交或计程车到安平树屋，按入口购票；从台南站出发也使用下方分段导航。",
      ),
      stop(
        "fort",
        "安平古堡",
        "上午",
        "历史街区",
        "走古堡与庭院，认识港口贸易和城防的层次。与树屋分别依票务规定入场。",
        "从树屋沿古堡街方向步行到古堡入口，路口按人行道走。",
      ),
      stop(
        "anping",
        "安平老街 · 延平街找剑狮",
        "午餐前后",
        "巷弄与午餐",
        "吃午餐，再在延平街周边找门楣、墙面上的剑狮。住家巷弄轻声走，看见就停，不逐一打卡。",
        "从古堡走往延平街老街，选开放巷道绕一小圈，饭后搭车回中西区。",
      ),
      stop(
        "oldtown",
        "赤崁楼",
        "午后可选",
        "旧城古迹",
        "喜欢历史建筑就选这里。修复、围挡与可入内范围看现场；不要求与孔庙、美术馆全走完。",
        "从安平搭车回赤崁楼周边，先喝水、休息，再决定是否进场。",
        true,
      ),
      stop(
        "confucius",
        "台南孔子庙与府中街",
        "午后可选",
        "庭院与街道",
        "留一段时间给庭院、老树和府中街。古迹累了，就在街边找间咖啡馆坐下。",
        "从赤崁楼方向步行或搭车往南门路孔庙；出庙后接府中街，不必专程绕神农街。",
        true,
      ),
      stop(
        "art",
        "台南国家美术馆筹备处（原南美馆2馆）",
        "午后可选",
        "展览／建筑",
        "2026台南艺术双年展官方使用这一名称，地址忠义路二段1号。进馆看当期票券与开放信息，只看建筑外观也可以。",
        "从孔庙／府中街走往忠义路二段1号；认原2馆白色建筑，不走到南门路的原1馆。",
        true,
      ),
      stop(
        "temple",
        "盐埕天后宫建醮（两晚选一）",
        "傍晚二选一",
        "民俗",
        "若昨晚还没去，今天留1—1.5小时；去过就按兴致休息或直接夜市吃饭。",
        "从中西区搭车去南区盐埕路291巷，散场后按当天夜市地址另搭一段车。",
        true,
      ),
      stop(
        start === 10 ? "dadong" : "wusheng",
        start === 10 ? "大东／大东东夜市" : "武圣夜市（周三替换）",
        "晚餐",
        "按星期选夜市",
        start === 10
          ? "今天12/15周二，大东与大东东正常营业日。两片夜市相邻，挑一片吃就好。"
          : "今天12/16周三，大东休市，自动改去武圣夜市。临时天气停业看当天公告。",
        "从庙会或中西区搭公交／计程车到夜市外围下车，再步行入内；吃完回中西区休息。",
        true,
      ),
    ],
    [
      nav("中西区 → 安平树屋", "oldtown", "tree"),
      nav("安平树屋 → 安平古堡", "tree", "fort", "walking"),
      nav("古堡 → 延平街老街", "fort", "anping", "walking"),
      nav("安平老街 → 赤崁楼", "anping", "oldtown"),
      nav("赤崁楼 → 孔庙", "oldtown", "confucius", "walking"),
      nav("孔庙 → 府中街", "confucius", "fuzhong", "walking"),
      nav("府中街 → 原南美馆2馆", "fuzhong", "art", "walking"),
      nav("赤崁楼 → 神农街街口（路过可选）", "oldtown", "shennong", "walking"),
      nav("中西区 → 盐埕天后宫", "oldtown", "temple"),
      nav(
        start === 10 ? "盐埕天后宫 → 大东夜市" : "盐埕天后宫 → 武圣夜市",
        "temple",
        start === 10 ? "dadong" : "wusheng",
      ),
      nav("夜市 → 中西区", start === 10 ? "dadong" : "wusheng", "oldtown"),
    ],
    "台南 · 第2晚",
    [
      section(
        "旧城下午，留一段坐下的时间",
        [
          "安平午餐后回市区，赤崁楼、孔庙与美术馆按兴趣挑一两处。神农街只在白天路过海安路街口时看看，不再专程安排夜游。",
          "国华街三段与永乐市场偏早午市，想吃碗粿、润饼或牛肉汤，留给明天出发前的早餐；上午若更想吃旧城小吃，也可用它替换安平整组。",
        ],
        [
          nav(
            "中西区 → 国华街三段／永乐市场（上午替换）",
            "oldtown",
            "guohua",
            "walking",
          ),
          link("双年展场馆名称、地址与票务", sources.art),
        ],
      ),
      festivalSection(),
      nightSection(start, 6),
    ],
    culture(
      "在巷口看见的剑狮",
      "安平的剑狮是住家门面上的辟邪装饰。它们散在日常街巷里，看见一两处就足够，不需要把住家门口围成拍照点。",
      "台南旅游网",
      "https://www.twtainan.net/zh-tw/",
    ),
  );

const portStops = () => [
  stop(
    "pier2",
    "驳二艺术特区与哈玛星",
    "午后",
    "港区慢走",
    "从旧仓库走到轨道与港边，选一处展览或咖啡馆。今天主线给港区留一整段时间。",
    "从美丽岛搭橘线至盐埕埔或哈玛星，步行接驳二；沿开放步道往哈玛星走，不追每个仓库展厅。",
  ),
  stop(
    "sizihwan",
    "西子湾夕阳",
    "傍晚二选一",
    "港边风景",
    "海风不大就留在本岛看海。不想等船时，这一项比旗津省一次往返。",
    "从哈玛星沿导航到开放观景点；冬季天黑早，留意返程与沿岸步道公告。",
    true,
  ),
  stop(
    "beach",
    "旗津港边与海岸",
    "傍晚替换项",
    "搭船看海",
    "天气、船班和体力都合适才渡海；它与西子湾二选一，风浪大时留驳二。",
    "先去鼓山轮渡站，搭船到旗津轮渡站，再步行到海岸。来回都查渡轮公告，不把旗津海岸当成船的下客站。",
    true,
  ),
];
const portLegs = () => [
  nav("美丽岛 → 驳二", "formosa", "pier2"),
  nav("驳二 → 哈玛星", "pier2", "hamasen", "walking"),
  nav("哈玛星 → 西子湾（本岛可选）", "hamasen", "sizihwan", "walking"),
  nav("哈玛星 → 鼓山轮渡站（旗津替换）", "hamasen", "gushan", "walking"),
  nav("鼓山 → 旗津码头查渡轮", "gushan", "cijin"),
  nav("旗津码头 → 海岸步行", "cijin", "beach", "walking"),
  nav("旗津海岸 → 码头返程", "beach", "cijin", "walking"),
  nav("旗津 → 鼓山返程渡轮", "cijin", "gushan"),
  nav("鼓山 → 美丽岛周边", "gushan", "formosa"),
];
const lotus = () => [
  stop(
    "dragon",
    "莲池潭龙虎塔",
    "上午",
    "民俗与水岸",
    "整修后已重新开放。按龙口入、虎口出的现场动线走；塔内以17:30前结束参观为参考，临时开放仍看现场。",
    "到新左营／高铁左营站先找寄物柜，满位则问有人服务。轻装搭公交或计程车到龙虎塔；台铁旧左营站与新左营不是同一站，不按步行十分钟误算。",
  ),
  stop(
    "spring",
    "春秋阁与潭边",
    "上午顺路",
    "湖畔散步",
    "沿潭边走一段看亭阁。想坐下来，就删掉继续环湖，不追完整一圈。",
    "从龙虎塔沿莲潭路与开放湖岸步道往春秋阁，之后搭车回新左营取箱。",
    true,
  ),
];
const kaohsiungDay = (start: number) =>
  day(
    7,
    start,
    "台南 → 高雄",
    "D7 台南 → 左营 → 高雄港边",
    "早餐后南下，先用新左营寄物接莲池潭，再进市区放箱。午后留给港区，西子湾与旗津只选一个看夕阳。",
    [
      stop(
        "guohua",
        "国华街三段／永乐市场早餐",
        "上午可选",
        "早午市",
        "想吃台南小吃就早一点出门。选择两三家开着的摊店，别把早餐吃成跨区排队。",
        "从中西区住宿附近走来，吃完回实际住处取箱，再去台南站。",
        true,
      ),
      stop(
        "zuoying",
        "台南站 → 新左营站寄物",
        "上午",
        "台铁南下",
        "搭停靠新左营的台铁班次。这里与高铁左营、捷运R16共构，寄物后去潭边。",
        "从中西区去台铁台南站，确认列车有停新左营；寄物柜容量先看现场，没位就缩短莲池潭或先到市区寄箱。",
      ),
      ...lotus(),
      stop(
        "formosa",
        "取箱 → 美丽岛／市区安顿",
        "午后",
        "住宿参考区",
        "回新左营取箱，红线进市区。酒店待订，以美丽岛或高雄车站周边接续；住左营也可寄存后再轻装进港区。",
        "从新左营共构站转捷运红线，按实际订房地址下车。先放箱再出门，路线以美丽岛作为市区起点参考。",
      ),
      ...portStops(),
    ],
    [
      nav("中西区 → 国华街早餐", "oldtown", "guohua", "walking"),
      nav("中西区 → 台南站取车", "oldtown", "tainan"),
      nav("台南站 → 新左营站", "tainan", "zuoying"),
      nav("新左营 → 龙虎塔", "zuoying", "dragon"),
      nav("龙虎塔 → 春秋阁", "dragon", "spring", "walking"),
      nav("春秋阁 → 新左营取箱", "spring", "zuoying"),
      nav("新左营 → 美丽岛", "zuoying", "formosa"),
      ...portLegs(),
      link("渡轮航线与停航公告", sources.ferry),
    ],
    "高雄 · 第1晚（美丽岛／左营等交通节点待选）",
    [
      section(
        "今天删哪一段最轻松",
        [
          "台南出发晚了，就缩短春秋阁或取消旗津，保住港边散步；若到新左营后寄物不便，也可直接进城放行李。塔内、展馆与渡轮各有开放限制，港边本身不必走成一条赶场清单。",
        ],
        [link("莲池潭景区与交通", sources.lotus)],
        true,
      ),
    ],
    culture(
      "从庙塔走到港口",
      "左营是潭边的民俗建筑，哈玛星是铁路与港口留下的街区。两片之间搭捷运接续，选几处看就能感到城市空间的变化。",
      "高雄旅游网 · 莲池潭",
      sources.lotus,
    ),
  );

const seaA1 = section(
  "Plan B · A1 南回看海往返（仅晚班机候选）",
  [
    "住宿不变的重一点改法：D8若已确认是晚班机，可考虑高雄站经枋寮往太麻里，出站短看海再原路回高雄取箱。精华车窗区间在枋山—多良—金仑—太麻里一带，列车也会频繁进隧道，多良不是一般旅客可下车的营业车站。",
    "这项暂不列入当天默认路线。往返纯车程要按实际快慢车预留约4—6小时，另加等车、出站步行、取行李和赴机场时间，整段出游至少按大半天考虑。确认去回两班都有座位，并保留航司要求的机场报到余量与列车延误余地后再启用。",
    "太麻里站到海边仍要步行；知本站位于内陆，不能当作一下车就看海的替代站。任一条件不合适，今天留在高雄早餐、采买和返程，或在D7港边多坐一会儿。",
  ],
  [
    nav("高雄站 → 太麻里站（先查当天班次）", "kaohsiung", "taimali"),
    nav("太麻里站 → 高雄站返程", "taimali", "kaohsiung"),
    nav("高雄站 → 小港机场", "kaohsiung", "khh"),
    link("台铁时刻与余票", sources.tra),
  ],
  true,
);
const departure = (start: number) =>
  day(
    8,
    start,
    "高雄 → 香港",
    "D8 高雄 → 香港",
    "早餐、退房、取行李，再去小港机场。今天按实际航班倒推，上午航班就直接赴机场；看海往返只保留为有条件候选。",
    [
      stop(
        "formosa",
        "早餐与退房",
        "返程前",
        "市区参考点",
        "住处附近吃早餐、买最后一点东西。离开前点齐护照、行李和伴手礼。",
        "路线以美丽岛站作为市区参考，实际按酒店地址选择最近捷运站或叫车。不要为了套用攻略先绕到美丽岛。",
      ),
      stop(
        "khh",
        "高雄国际机场 · 小港",
        "按航班倒推",
        "返程",
        "搭捷运红线往小港方向，在高雄国际机场站下车，跟随国际航厦标识。报到截止与到机场时间按航空公司要求。",
        "美丽岛可直搭红线至机场；住左营则从R16搭同线南下。大件行李多或时间不顺时搭计程车。",
      ),
    ],
    [
      nav("美丽岛站 → 高雄国际机场", "formosa", "khh"),
      nav("左营站 → 高雄国际机场（住宿备选）", "zuoying", "khh"),
    ],
    "返程 · 不再住宿",
    [seaA1],
    culture(
      "最后一天留一点余量",
      "航班确定之后再决定早餐和采买。住处到车站的步行、取箱、候车和机场安检都要计入返程，港边的风景不必靠最后一趟车补齐。",
      "高雄国际机场",
      "https://www.kia.gov.tw/",
    ),
  );

const yilan = section(
  "Plan B · A2 头城／外澳轻旅行（替换午后）",
  [
    "维持原住宿，想补一段东岸海景，可以用老城日午后替换大稻埕／中正纪念堂（主日期D2，备选日期D4）：从台北站搭往头城或外澳的台铁，选一站落脚。区间车常需接近两小时或更久，具体看直达、待避与换乘，往返留出完整半天。总统府上午参观后若出发太晚，就另选空档或放弃。",
    "南下出草岭隧道后，海岸大致在行进方向左侧，可看龟山岛方向；北上反过来。海景会受列车、隧道、天气和座位遮挡影响。头城老街偏人文，外澳偏沙滩，半天只选其一。",
    "台北和宜兰天气可能不同，先分别看沿线预报。东北季风强、沿岸下雨就留台北走大稻埕，不到海边硬撑；已买指定班次车票时，退改仍按台铁规则处理。",
  ],
  [
    nav("台北站 → 头城站", "taipei", "toucheng"),
    nav("台北站 → 外澳站（另一选择）", "taipei", "waiao"),
    nav("外澳站 → 沙滩步行", "waiao", "waiaoBeach", "walking"),
    nav("外澳站 → 台北站返程", "waiao", "taipei"),
    link("台铁当天班次", sources.tra),
    link("气象署冬季气候", sources.weather),
  ],
  true,
);

function eastPlans(start: number): TaiwanDay[] {
  const officeOnMonday = start === 11;
  const d1 = arrival(start);
  d1.stops[1].detail =
    "台北连住三晚，订房后把车站或中山参考点换成实际地址，先放行李再散步。";
  d1.stay = "台北 · 第1晚（车站／中山周边待选）";
  const d2 = officeOnMonday ? skyline(2, start) : oldCity(2, start);
  // Spread the Taipei core across days: exhibition and workshop keep a whole day.
  if (!officeOnMonday) {
    const skylineStops = skyline(2, start).stops;
    d2.name = "D2 台北 · 总统府与信义区";
    d2.stops = [...d2.stops.slice(0, 4), ...skylineStops.slice(0, 3)];
    d2.note =
      "上午总统府，午后101与国父园区；市场、龙山寺和象山按体力取舍。今天取消大稻埕下午，把跨区后的时间留给信义区。";
    d2.stops[0].priority = "optional";
    d2.stops[1].priority = "optional";
    d2.stops.at(-1)!.priority = "optional";
    d2.legs = [
      ...d2.legs.slice(0, 5),
      nav("西门 → 国父纪念馆", "ximen", "memorial"),
      ...skyline(2, start).legs.slice(1, 3),
    ];
    d2.sections = [
      section(
        "半环岛的台北取舍",
        [
          "今天把总统府与信义区放在同一天。东三水早市、龙山寺能早起就去；午后有体力再走象山。大稻埕放D1，北投汤屋与小潘板桥采购在这条候补路线中让出。主方案完整保留它们。",
        ],
        undefined,
        true,
      ),
    ];
    d2.culture = skyline(2, start).culture;
  } else {
    d2.sections = [
      section(
        "周六的旧城可选项",
        [
          "今天总统府没有一般工作日参观，先走信义区。若愿意早起，可用东三水早餐与龙山寺替换上午园区，再午后去101；总统府移到D4周一上午。国父园区与象山按精力取舍。",
        ],
        [
          nav("台北站 → 东三水市场", "taipei", "market"),
          nav("东三水 → 龙山寺", "market", "longshan", "walking"),
          nav("龙山寺 → 国父园区", "longshan", "memorial"),
        ],
        true,
      ),
    ];
  }
  const d3 = museumDay(3, start);
  d3.sections = [
    section(
      "明天沿海出发",
      [
        "今晚整理好行李。半环岛从明天开始几乎每天换住宿，轻装比多带一只箱子更有用；故宫和手作课都保留完整半天，不再追加101。北投与板桥采购留给西线主方案。",
      ],
      undefined,
      true,
    ),
  ];
  const d4 = day(
    4,
    start,
    "台北 → 花莲",
    "D4 台北 → 花莲 · 北回线看海",
    officeOnMonday
      ? "今天周一，先参观总统府再搭午后火车南下。下午能留多少海边时间取决于实际到站，晚到就只逛市区。"
      : "上午或午后搭台铁南下，不为凑景点赶早车。抵达后先放行李，七星潭与市区只选一个。",
    [
      ...(officeOnMonday
        ? [
            oldCity(4, start).stops[2],
            stop(
              "ximen",
              "西门红楼周边午餐",
              "参观后可选",
              "顺路短逛",
              "周一红楼展馆可能休馆，午餐和街区短逛仍可按店家营业安排。",
              "从总统府三号门沿宝庆路走向西门，午餐后回实际寄物处拿箱，再到台北站。",
              true,
            ),
          ]
        : []),
      stop(
        "hualien",
        "台北站 → 花莲站",
        "上午／午后",
        "北回线",
        "南下选行进方向左侧靠窗。清水断崖一带有海景窗口，也有大量隧道，不能理解为一路贴海或必见完整断崖。",
        "台北站按车次上车，到花莲后先寄箱或入住。车票开售、行车状态与天气出发前再查。",
      ),
      stop(
        "qixingtan",
        "七星潭或花莲市区",
        "午后可选",
        "海边替换",
        "天气好、到站尚早就去七星潭看海；风大、晚到则在市区吃饭。这里是观海点，勿靠近浪线。",
        "花莲站到七星潭另搭公交或计程车，住宿在市区则先放箱；看完回市区，不临时再加太鲁阁。",
        true,
      ),
    ],
    [
      ...(officeOnMonday
        ? [
            nav("台北站 → 总统府三号门", "taipei", "office"),
            link("总统府参观规则", sources.president),
            nav("三号门 → 西门周边", "office", "ximen", "walking"),
            nav("西门 → 台北站取车", "ximen", "taipei"),
          ]
        : []),
      nav("台北站 → 花莲站", "taipei", "hualien"),
      nav("花莲站 → 七星潭", "hualien", "qixingtan"),
      nav("花莲站 → 市区（天气替换）", "hualien", "hualienCity"),
    ],
    "花莲 · 第1晚（车站／市区待选）",
    [],
    culture(
      "把火车当作风景的一部分",
      "车窗里能看到山靠近海的地形。隧道间隙不长，坐下看就好；北回线与太鲁阁园区的开放是不同事情，这条路线不安排峡谷步道。",
      "台铁 · 时刻与行车资讯",
      sources.tra,
    ),
  );
  const d5 = day(
    5,
    start,
    "花莲 → 台东",
    "D5 花莲 → 台东 · 花东纵谷",
    "这段以纵谷、田地与山景为主，海景留给明天南回。抵达台东后只选铁花商圈或海滨公园，留时间吃饭。",
    [
      stop(
        "taitung",
        "花莲站 → 台东站",
        "上午／午后",
        "纵谷铁路",
        "南下沿花东线看纵谷，左右两边都有山与田野。这里不是东海岸公路，不按整段看海选座。",
        "从花莲站上预订班次，台东站下车后再转往市区；车站不在铁花商圈旁边。",
      ),
      stop(
        "tiehua",
        "铁花商圈／铁道艺术村",
        "午后至傍晚",
        "市区散步",
        "原铁花音乐聚落已结束原有营运，今天按铁道艺术村和周边街区散步；演出与市集看当日公告。",
        "台东站搭公交或计程车进市区，认铁道艺术村周边；先放行李再散步。",
        true,
      ),
      stop(
        "taitungCoast",
        "台东海滨公园",
        "傍晚替换项",
        "海风",
        "与铁花商圈二选一，天气好就看海，风雨大则吃晚饭休息。",
        "从市区按步行或短程搭车导航到海滨公园，沿开放步道散步，不靠近浪区。",
        true,
      ),
    ],
    [
      nav("花莲站 → 台东站", "hualien", "taitung"),
      nav("台东站 → 铁花商圈", "taitung", "tiehua"),
      nav("铁花商圈 → 海滨公园（替换）", "tiehua", "taitungCoast", "walking"),
    ],
    "台东 · 第1晚（市区待选）",
    [],
    culture(
      "纵谷也有自己的节奏",
      "从花莲到台东，铁路多数时间在山与田之间。今天让沿途风景占掉一部分行程，到站后不再补一串海岸景点。",
      "台东观光旅游网",
      "https://tour.taitung.gov.tw/zh-tw/",
    ),
  );
  const d6 = day(
    6,
    start,
    "台东 → 台南",
    "D6 台东 → 枋寮 → 台南",
    "默认上午搭台铁南回线常规班次，车窗看海后转车去台南。抵达先安顿，建醮与夜市按到站时间留一项或两项。",
    [
      stop(
        "fangliao",
        "台东站 → 枋寮 · 南回线",
        "上午",
        "海景铁路",
        "行进方向左侧看太平洋。经太麻里、金仑、多良与枋山一带有沿海窗口，隧道很多，列车停站依班次。",
        "从台东市区返回台东站，上已订好的台铁常规班次往枋寮；不要把蓝皮解忧号当成早班车。",
      ),
      stop(
        "tainan",
        "枋寮 → 台南站／中西区",
        "午后至傍晚",
        "换乘与住宿",
        "常规列车到枋寮后北上台南，是否直达与换乘按实际班次。先把箱子放下，再决定晚间活动。",
        "在枋寮按订票方案转车往台南，到站再去中西区；给转乘留余量，避开最后一班能接上的组合。",
      ),
      stop(
        "temple",
        "盐埕天后宫五朝建醮",
        "傍晚可选",
        "民俗",
        "两种日期均遇上五朝清醮期间。到台南早、还有精神就去；晚到直接吃饭。",
        "从中西区搭车到南区盐埕路291巷，最后一段步行入巷，按现场公开区域旁观。",
        true,
      ),
      stop(
        start === 10 ? "dadong" : "wusheng",
        start === 10 ? "大东／大东东夜市" : "武圣夜市（周三替换）",
        "晚餐可选",
        "日期已联动",
        start === 10
          ? "今天12/15周二，大东营业；搭常规早班车抵达才有较多弹性。"
          : "今天12/16周三，大东休市，改武圣。",
        "从住处或庙会现场按当晚夜市导航搭车，吃完回中西区。",
        true,
      ),
    ],
    [
      nav("台东站 → 枋寮站", "taitung", "fangliao"),
      nav("枋寮站 → 台南站", "fangliao", "tainan"),
      nav("台南站 → 中西区参考点", "tainan", "oldtown"),
      nav("中西区 → 盐埕天后宫", "oldtown", "temple"),
      nav(
        start === 10 ? "盐埕天后宫 → 大东夜市" : "盐埕天后宫 → 武圣夜市",
        "temple",
        start === 10 ? "dadong" : "wusheng",
      ),
    ],
    "台南 · 第1晚（中西区待选）",
    [
      section(
        "蓝皮解忧号 · 另订的替换体验",
        [
          "想坐复古开窗列车，可以另查蓝皮解忧号台东至枋寮单程产品。它是预约制观光行程，台东往枋寮通常安排在午后，具体发车与营运日以营运商当期订单为准；若选蓝皮，这一天就按午后出发重排。",
          "改坐蓝皮后，枋寮抵达和台南入住都会推迟，今天就把建醮与夜市从保证项目中拿掉。若最想看台南科仪，选台铁常规班次上午出发更合适。开窗、停靠与导览安排按营运规则，不写成全程贴海。",
        ],
        [link("蓝皮解忧号 · 营运商产品与预约", sources.blue)],
        true,
      ),
      festivalSection(),
      nightSection(start, 6),
    ],
    culture(
      "南回线不是一整面海",
      "太平洋、隧道、聚落和山坡交替出现，左侧座位适合南下看海，花东纵谷那段则以山景为主。把行李放稳，留一段安静看窗外的时间。",
      "台铁 · 行车与订票",
      sources.tra,
    ),
  );
  const d7 = day(
    7,
    start,
    "台南 → 高雄",
    "D7 台南古迹 → 高雄港边",
    "半环岛只住台南一晚，今天上午在安平或中西区选一组；午后到高雄后，莲池潭与港区也选一组。两座城市都留一点遗憾，比一路赶场合适。",
    [
      stop(
        "tree",
        "安平树屋＋古堡，或中西区赤崁楼",
        "上午二选一",
        "古迹取舍",
        "安平组看树屋、古堡与老街午餐；旧城组则早餐后看赤崁楼、孔庙一带。只选一片，不跨区补全。",
        "住中西区想轻松就步行旧城；选安平则另搭车往返，之后回住处拿箱到台南站。",
      ),
      stop(
        "zuoying",
        "台南站 → 新左营／市区寄箱",
        "午后",
        "跨城",
        "想看塔就在新左营寄箱；想港边夕阳则先去实际住宿处放行李，直接进港区。",
        "台南站搭停靠新左营的台铁，再按住宿与所选景区决定寄物点；不要为了寄柜多来回一趟。",
      ),
      ...lotus().map((s) => ({
        ...s,
        period: "午后替换项",
        priority: "optional" as const,
      })),
      ...portStops().map((s) => ({ ...s, priority: "optional" as const })),
    ],
    [
      nav("中西区 → 安平树屋（古迹方案一）", "oldtown", "tree"),
      nav("树屋 → 古堡", "tree", "fort", "walking"),
      nav("古堡 → 安平老街", "fort", "anping", "walking"),
      nav("中西区 → 孔庙（古迹方案二）", "oldtown", "confucius", "walking"),
      nav("中西区 → 台南站", "oldtown", "tainan"),
      nav("台南站 → 新左营", "tainan", "zuoying"),
      nav("新左营 → 龙虎塔（高雄方案一）", "zuoying", "dragon"),
      nav("龙虎塔 → 春秋阁", "dragon", "spring", "walking"),
      nav("新左营 → 美丽岛取放行李", "zuoying", "formosa"),
      ...portLegs(),
    ],
    "高雄 · 第1晚（交通节点待选）",
    [
      section(
        "今天明确舍弃的部分",
        [
          "安平与中西区的完整一日游、莲池潭与港边的完整半日游，都保留在西线主方案。半环岛把时间让给三段铁路，台南和高雄就按上面的二选一走，不再把所有古迹与夕阳点塞回一天。",
        ],
        undefined,
        true,
      ),
    ],
    culture(
      "最后一段留给喜欢的街区",
      "喜欢庙塔就去莲池潭，喜欢港边就去哈玛星。下车后选一片慢慢走，今天不再增加另一趟长距离交通。",
      "高雄旅游网 · 莲池潭",
      sources.lotus,
    ),
  );
  const days = [d1, d2, d3, d4, d5, d6, d7, departure(start)];
  // Recompute route summaries when a template's stops were changed.
  for (const d of days) {
    d.route = d.stops.map((s) => s.name).join(" → ");
    d.previewUrl = `https://www.google.com/maps/dir/${d.stops.map((s) => encodeURIComponent(s.mapQuery)).join("/")}/`;
  }
  return days;
}
function buildPlan(start: 10 | 11, journey: "west" | "east"): TaiwanPlan {
  const east = journey === "east";
  const days = east
    ? eastPlans(start)
    : [
        arrival(start),
        start === 10 ? oldCity(2, start) : skyline(2, start),
        museumDay(3, start),
        start === 10 ? skyline(4, start) : oldCity(4, start),
        beitou(start),
        tainanDay(start),
        kaohsiungDay(start),
        departure(start),
      ];
  const westRoutes = [
    "桃园机场 → 台北车站安顿；大稻埕／宁夏按抵达时间可选",
    "东三水早市 → 龙山寺 → 总统府；西门午餐，老城下午择一",
    "故宫 → 士林午餐 → 郭元益凤梨酥DIY",
    "国父纪念馆园区 → 101观景台 → 象山；晚餐按体力选择",
    "北投独立汤屋 → 取箱 → 高铁南下；板桥采购与庙会可选",
    "安平树屋 → 古堡与老街；午后旧城择一，傍晚建醮／夜市",
    "台南早餐 → 新左营寄箱 → 莲池潭 → 高雄港区",
    "早餐、退房 → 小港机场；晚班机看海另查条件",
  ];
  const eastRoutes = [
    westRoutes[0],
    "台北核心浓缩；市场与象山看体力，101保留",
    westRoutes[2],
    "台北 → 花莲；七星潭与市区择一",
    "花莲 → 花东纵谷 → 台东市区",
    "台东 → 南回线 → 枋寮 → 台南；晚间按到站时间选择",
    "台南古迹择一 → 高雄；莲池潭与港边择一",
    westRoutes[7],
  ];
  days.forEach((d, index) => {
    const westIndex =
      start === 11 && (index === 1 || index === 3) ? 4 - index : index;
    d.route = east ? eastRoutes[index] : westRoutes[westIndex];
  });
  if (!east) days[start === 10 ? 1 : 3].sections.push(yilan);
  return {
    id: east ? `east-${start}` : start === 10 ? "comfort" : "later",
    journey,
    departure: String(start) as "10" | "11",
    label: `12/${start}出发`,
    range: `2026 · 12/${start}—12/${start + 7}`,
    days,
    nights: east
      ? "台北3晚 · 花莲1晚 · 台东1晚 · 台南1晚 · 高雄1晚"
      : "台北4晚 · 台南2晚 · 高雄1晚",
    summary: east
      ? "顺时针半环岛候补：北回、纵谷、南回三段铁路，减少城市停留，北投与板桥采购让出。"
      : "西线慢游主方案：故宫、手作、101与北投保留，台南留给古迹、建醮和吃饭。",
    budget: { flight: 1800, hotel: east ? 11500 : 10000, food: 4000 },
  };
}
export const taiwanPlans: TaiwanPlan[] = [
  buildPlan(10, "west"),
  buildPlan(11, "west"),
  buildPlan(10, "east"),
  buildPlan(11, "east"),
];
export const taiwanDays = taiwanPlans[0].days;
export const taiwanRailNotes = {
  title: "东海岸看海铁道候补方案",
  paragraphs: [
    "主方案先走西线。想补海景有两种力度：保持住宿的A1／A2短途替换，或改成台北3晚、花莲1晚、台东1晚、台南1晚、高雄1晚的顺时针半环岛。后者每天搬箱次数更多，适合把坐火车本身当作旅行的人。",
    "选座按列车实际行进方向：台北→宜兰→花莲→台东→枋寮南下，沿海段优先左侧靠窗；反向北上优先右侧。花莲→台东走纵谷，多数时间看田地与山；隧道、车厢布局和遮挡都会影响海景，座号不直接等于看海侧。",
    "12月东北季风下，宜兰与北回线常有阴雨。南回线部分区间在屏东侧较干，台东海岸仍可能有风雨，不能用背风面概括整条线；当天能否见蓝海，看沿途预报与能见度。",
    "轻量A2放在老城日午后（主日期D2、备选日期D4），头城与外澳选一处，替换老城下午；A1放在D8，仅晚班机且往返车次与机场余量确认后启用。两项都不改变住宿。半环岛会让出北投泡汤与小潘采购，故宫和DIY仍各留半天。",
  ],
  links: [
    link("台铁时刻、车票与行车状态", sources.tra),
    link("气象署 · 冬季气候", sources.weather),
    link("蓝皮解忧号 · 当期产品", sources.blue),
  ],
};
