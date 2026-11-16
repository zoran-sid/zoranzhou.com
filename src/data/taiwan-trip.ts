export interface TaiwanStop {
  name: string;
  mapQuery: string;
  kind: string;
  detail: string;
  period: string;
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
  stay: string;
  pace: string;
}
export interface TaiwanPlan {
  id: string;
  label: string;
  range: string;
  nights: string;
  summary: string;
  days: TaiwanDay[];
  budget: { flight: number; hotel: number; food: number };
}
// All map positions use venue names or verified addresses. Dates are planning candidates.
// Budget inputs are per person; lodging is the amount actually borne by that traveller.
export const TAIWAN_BUDGET_RESERVE = 8000;
export const taiwanPlans: TaiwanPlan[] = [
  {
    id: "comfort",
    label: "8天 · 12/10",
    range: "12/10—12/17 · 出发日候选",
    nights: "台北4晚 · 台南2晚 · 高雄1晚",
    summary:
      "故宫、手作、101登顶、国父园区、象山和独立汤屋都保留；北投安排在南下日。",
    days: [
      {
        id: 1,
        date: "12/10",
        base: "台北",
        name: "抵达与入住",
        route: "桃园机场 → A1 → 开封街酒店 → 宁夏夜市",
        note: "抵达当天只安排入境、交通和入住。宁夏夜市只是酒店附近的晚餐备选，不增加固定活动。",
        stops: [
          {
            name: "桃园国际机场",
            kind: "抵达",
            detail: "下午抵达后先处理入境、现金和交通卡，出站时间留出弹性。",
            period: "抵达后",
            mapQuery: "桃園國際機場",
          },
          {
            name: "台北车站区域",
            kind: "换乘",
            detail:
              "A1、捷运与高铁出口编号不同；机场捷运到店使用A1的5号出口链接。",
            period: "换乘",
            mapQuery: "桃園機場捷運A1台北車站",
          },
          {
            name: "天雲旅棧台北開封分館",
            kind: "住宿",
            detail: "开封街一段33号。先放好行李；到店认分馆名与门牌。",
            period: "先入住",
            mapQuery: "台北市中正區開封街一段33號",
          },
          {
            name: "宁夏夜市",
            kind: "美食",
            detail: "晚餐先选两三样，热门摊位售完时换附近店。",
            period: "晚餐可选",
            mapQuery: "寧夏夜市 台北市",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/%E6%A1%83%E5%9C%92%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4/%E6%A1%83%E5%9C%92%E6%A9%9F%E5%A0%B4%E6%8D%B7%E9%81%8BA1%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%99/%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F/%E5%AF%A7%E5%A4%8F%E5%A4%9C%E5%B8%82%20%E5%8F%B0%E5%8C%97%E5%B8%82/",
        legs: [
          {
            label: "机场 → A1 公共交通",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%A1%83%E5%9C%92%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4&destination=%E6%A1%83%E5%9C%92%E6%A9%9F%E5%A0%B4%E6%8D%B7%E9%81%8B+A1%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "A1 的5号出口 → 酒店步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%A1%83%E5%9C%92%E6%A9%9F%E5%A0%B4%E6%8D%B7%E9%81%8B+A1%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%995%E8%99%9F%E5%87%BA%E5%8F%A3&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=walking",
          },
          {
            label: "酒店 → 宁夏夜市步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%AF%A7%E5%A4%8F%E5%A4%9C%E5%B8%82+%E5%8F%B0%E5%8C%97%E5%B8%82&travelmode=walking",
          },
        ],
        culture: {
          title: "夜市先从小份开始",
          body: "宁夏以小吃为主，第一晚先选两三样，现金准备小额面钞。酒店入住后再决定是否出门，晚到就近用餐。",
          source: {
            title: "台北市旅游网 · 宁夏夜市",
            url: "https://www.travel.taipei/en/attraction/details/1689/",
          },
        },
        stay: "台北 · 开封馆，第1晚",
        pace: "移动日",
      },
      {
        name: "从早市走进老台北",
        route: "东三水早市 → 龙山寺 → 总统府 → 中正纪念堂可选 → 饶河晚餐可选",
        note: "市场早点去；以09:30前后到总统府排队为目标，11:30前最后入府。午后留休息时间，中正纪念堂可删，饶河只选两三样。",
        stops: [
          {
            name: "东三水街市场",
            mapQuery: "東三水街市場 台北市萬華區三水街",
            kind: "市井",
            period: "早上早餐",
            detail:
              "官方资料列07:00–12:00，先看实际出摊；旁边的新富市场是另一处市场，周一休市规则不同。",
          },
          {
            name: "艋舺龙山寺",
            mapQuery: "艋舺龍山寺 臺北市萬華區廣州街211號",
            kind: "信仰",
            period: "早餐后",
            detail: "看建筑、香火和往来的日常，按现场动线参观，不挡参拜通道。",
          },
          {
            name: "总统府参观三号门",
            mapQuery: "總統府三號門 寶慶路 博愛路 臺北市",
            kind: "历史",
            period: "上午入府",
            detail:
              "个人少于15人无需预约，携带有照片的身份证件，经安检入内；入口在宝庆路与博爱路口。",
          },
          {
            name: "中正纪念堂（可选）",
            mapQuery: "中正紀念堂 臺北市",
            kind: "建筑",
            period: "午后可选",
            detail: "留给建筑和广场，累了就回住宿休息，不再强制参观每个展厅。",
          },
          {
            name: "饶河街夜市（晚餐可选）",
            mapQuery: "饒河街觀光夜市 臺北市",
            kind: "美食",
            period: "晚上二选一",
            detail:
              "和酒店附近晚餐二选一；若上午走累，可挪到手作课那天，信义区爬山当天不再叠加夜市。",
          },
        ],
        legs: [
          {
            label: "酒店 → 东三水市场",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E6%9D%B1%E4%B8%89%E6%B0%B4%E8%A1%97%E5%B8%82%E5%A0%B4&travelmode=transit",
          },
          {
            label: "东三水 → 龙山寺步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%9D%B1%E4%B8%89%E6%B0%B4%E8%A1%97%E5%B8%82%E5%A0%B4&destination=%E8%89%8B%E8%88%BA%E9%BE%8D%E5%B1%B1%E5%AF%BA&travelmode=walking",
          },
          {
            label: "龙山寺 → 总统府三号门",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%89%8B%E8%88%BA%E9%BE%8D%E5%B1%B1%E5%AF%BA&destination=%E7%B8%BD%E7%B5%B1%E5%BA%9C%E4%B8%89%E8%99%9F%E9%96%80+%E5%AF%B6%E6%85%B6%E8%B7%AF+%E5%8D%9A%E6%84%9B%E8%B7%AF&travelmode=transit",
          },
          {
            label: "总统府开放时段与证件说明",
            url: "https://www.president.gov.tw/Page/124",
          },
          {
            label: "总统府 → 中正纪念堂（可选）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%B8%BD%E7%B5%B1%E5%BA%9C%E4%B8%89%E8%99%9F%E9%96%80+%E5%AF%B6%E6%85%B6%E8%B7%AF+%E5%8D%9A%E6%84%9B%E8%B7%AF&destination=%E4%B8%AD%E6%AD%A3%E7%B4%80%E5%BF%B5%E5%A0%82&travelmode=transit",
          },
          {
            label: "酒店 → 饶河夜市（晚餐可选）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E9%A5%92%E6%B2%B3%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82&travelmode=transit",
          },
          {
            label: "饶河 → 酒店",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%A5%92%E6%B2%B3%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "先吃一顿市场早餐",
          body: "把市场、寺庙与老城放在同一天，能看到摊位开张、街坊买菜和参拜的生活。总统府参观守住上午窗口，其余时间给街区和休息。",
          source: {
            title: "台北旅游网 · 东三水市场",
            url: "https://travel.taipei/zh-tw/attraction/details/2173",
          },
        },
        base: "台北",
        pace: "街区日",
        previewUrl:
          "https://www.google.com/maps/dir/%E6%9D%B1%E4%B8%89%E6%B0%B4%E8%A1%97%E5%B8%82%E5%A0%B4%20%E5%8F%B0%E5%8C%97%E5%B8%82%E8%90%AC%E8%8F%AF%E5%8D%80%E4%B8%89%E6%B0%B4%E8%A1%97/%E8%89%8B%E8%88%BA%E9%BE%8D%E5%B1%B1%E5%AF%BA%20%E8%87%BA%E5%8C%97%E5%B8%82%E8%90%AC%E8%8F%AF%E5%8D%80%E5%BB%A3%E5%B7%9E%E8%A1%97211%E8%99%9F/%E7%B8%BD%E7%B5%B1%E5%BA%9C%E4%B8%89%E8%99%9F%E9%96%80%20%E5%AF%B6%E6%85%B6%E8%B7%AF%20%E5%8D%9A%E6%84%9B%E8%B7%AF%20%E8%87%BA%E5%8C%97%E5%B8%82/%E4%B8%AD%E6%AD%A3%E7%B4%80%E5%BF%B5%E5%A0%82%20%E8%87%BA%E5%8C%97%E5%B8%82/%E9%A5%92%E6%B2%B3%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82%20%E8%87%BA%E5%8C%97%E5%B8%82/",
        id: 2,
        date: "12/11",
        stay: "台北 · 开封馆，第2晚",
      },
      {
        name: "故宫与亲手做凤梨酥",
        route: "故宫入馆 → 士林午餐 → 郭元益凤梨酥DIY → 回酒店",
        note: "故宫正式保留。上午看重点展厅；下午为手作课预留两小时，两处之间需要乘车。14:00–16:00只是候选排法，按12月实际可订课次调整。",
        stops: [
          {
            name: "国立故宫博物院",
            mapQuery: "國立故宮博物院 臺北市",
            kind: "文化",
            period: "上午入馆",
            detail:
              "预留约三小时，先选想看的展厅与展品；不在同一上午排热门早餐长队。",
          },
          {
            name: "郭元益士林馆·凤梨酥DIY",
            mapQuery: "臺北市士林區文林路546號",
            kind: "手作",
            period: "下午预约课",
            detail:
              "地址在文林路546号四楼，按订单提前报到。12岁以上参加者各自报名，不默认有免费陪同名额。",
          },
          {
            name: "天雲旅棧台北開封分館",
            mapQuery: "台北市中正區開封街一段33號",
            kind: "休息",
            period: "结束后回店",
            detail:
              "故宫与手作已是完整的一天，晚餐就近；饶河只在前一天未去且有体力时补。",
          },
        ],
        legs: [
          {
            label: "酒店 → 故宫",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2+%E8%87%BA%E5%8C%97%E5%B8%82&travelmode=transit",
          },
          {
            label: "故宫开放与展览",
            url: "https://www.npm.gov.tw/",
          },
          {
            label: "故宫 → 郭元益士林馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2+%E8%87%BA%E5%8C%97%E5%B8%82&destination=%E8%87%BA%E5%8C%97%E5%B8%82%E5%A3%AB%E6%9E%97%E5%8D%80%E6%96%87%E6%9E%97%E8%B7%AF546%E8%99%9F&travelmode=transit",
          },
          {
            label: "凤梨酥课程介绍（已选项目）",
            url: "https://www.kuos.com/zh-TW/pages/pineapple-cake-diy-introduction",
          },
          {
            label: "郭元益官方课程预约",
            url: "https://www.kuos.com/zh-TW/pages/handcraft-course",
          },
          {
            label: "郭元益士林馆 → 酒店",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8C%97%E5%B8%82%E5%A3%AB%E6%9E%97%E5%8D%80%E6%96%87%E6%9E%97%E8%B7%AF546%E8%99%9F&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "把展览和手作各留半天",
          body: "这一天围绕士林安排。故宫看文物，下午自己揉面、包馅、烘烤和包装，留出吃饭和换乘时间，不再跨城追一串景点。",
          source: {
            title: "郭元益 · 课程说明",
            url: "https://www.kuos.com/zh-TW/pages/pineapple-cake-diy-introduction",
          },
        },
        base: "台北",
        pace: "文化与手作",
        previewUrl:
          "https://www.google.com/maps/dir/%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2%20%E8%87%BA%E5%8C%97%E5%B8%82/%E8%87%BA%E5%8C%97%E5%B8%82%E5%A3%AB%E6%9E%97%E5%8D%80%E6%96%87%E6%9E%97%E8%B7%AF546%E8%99%9F/%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F/",
        id: 3,
        date: "12/12",
        stay: "台北 · 开封馆，第3晚",
      },
      {
        name: "国父纪念馆、101登顶与象山",
        route: "国父纪念馆园区 → 午餐 → 台北101登顶 → 象山开放步道",
        note: "三处都保留：国父纪念馆目前馆体整修，按园区与外观安排；101是真正登观景台。塔上游览放午后较早时段，山上留足日照，晚上不再加夜市。",
        stops: [
          {
            name: "国父纪念馆（园区与外观）",
            mapQuery: "國立國父紀念館 臺北市",
            kind: "建筑",
            period: "上午",
            detail:
              "馆体目前整修中，能否入馆按最新开放公告；园区通道也按现场围挡走。",
          },
          {
            name: "台北101观景台·登顶",
            mapQuery: "台北101觀景台",
            kind: "城市风景",
            period: "午后较早时段",
            detail:
              "预约实际可用的观景台时段，计入排队与安检；不要把塔上日落票和象山日落同时设成固定目标。",
          },
          {
            name: "象山灵云宫登山口",
            mapQuery: "象山步道靈雲宮登山口 臺北市",
            kind: "步道",
            period: "下午看天气",
            detail:
              "步道部分路段施工。Google导航只到登山口，山上按官方开放图走；观景后原路或按开放路线返回。",
          },
        ],
        legs: [
          {
            label: "酒店 → 国父纪念馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%8B%E7%AB%8B%E5%9C%8B%E7%88%B6%E7%B4%80%E5%BF%B5%E9%A4%A8&travelmode=transit",
          },
          {
            label: "国父纪念馆 → 101步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%9C%8B%E7%AB%8B%E5%9C%8B%E7%88%B6%E7%B4%80%E5%BF%B5%E9%A4%A8&destination=%E5%8F%B0%E5%8C%97101&travelmode=walking",
          },
          {
            label: "101观景台与预约",
            url: "https://www.taipei-101.com.tw/",
          },
          {
            label: "101 → 象山登山口步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97101&destination=%E8%B1%A1%E5%B1%B1%E6%AD%A5%E9%81%93%E9%9D%88%E9%9B%B2%E5%AE%AE%E7%99%BB%E5%B1%B1%E5%8F%A3&travelmode=walking",
          },
          {
            label: "象山部分路段工程公告",
            url: "https://www.gov.taipei/News_Content.aspx?n=D0042A87C2F0270A&s=8826D23D548E4171",
          },
          {
            label: "象山登山口 → 酒店",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%B1%A1%E5%B1%B1%E6%AD%A5%E9%81%93%E9%9D%88%E9%9B%B2%E5%AE%AE%E7%99%BB%E5%B1%B1%E5%8F%A3&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "把信义区留成一天",
          body: "从纪念建筑到高楼，再到山坡上的城市视角，地点虽近，登观景台和走石阶都需要时间。这一天只围绕信义区走，雨天保留101，象山按天气和开放情况调整。",
          source: {
            title: "台北旅游网 · 国父纪念馆现况",
            url: "https://www.travel.taipei/zh-tw/attraction/details/24",
          },
        },
        base: "台北",
        pace: "城市与山景",
        previewUrl:
          "https://www.google.com/maps/dir/%E5%9C%8B%E7%AB%8B%E5%9C%8B%E7%88%B6%E7%B4%80%E5%BF%B5%E9%A4%A8%20%E8%87%BA%E5%8C%97%E5%B8%82/%E5%8F%B0%E5%8C%97101%E8%A7%80%E6%99%AF%E5%8F%B0/%E8%B1%A1%E5%B1%B1%E6%AD%A5%E9%81%93%E9%9D%88%E9%9B%B2%E5%AE%AE%E7%99%BB%E5%B1%B1%E5%8F%A3%20%E8%87%BA%E5%8C%97%E5%B8%82/",
        id: 4,
        date: "12/13",
        stay: "台北 · 开封馆，第4晚",
      },
      {
        name: "北投地热与私汤，之后南下台南",
        route:
          "酒店退房寄箱 → 硫磺谷地热景观区 → 独立汤屋 → 取箱 → 高铁台南 → 沙仑 → 台南入住",
        note: "今天先在台北酒店退房寄箱，北投只排地质观景和独立汤屋。汤屋时段确认后再配高铁，泡完回酒店取箱，傍晚或晚间到台南；到店后只吃饭、休息。 12/14是周一，地热谷休园，改硫磺谷地面观景，不排泡脚池。",
        stops: [
          {
            name: "硫磺谷地热景观区",
            mapQuery: "硫磺谷地熱景觀區 臺北市北投區泉源路",
            kind: "地质",
            period: "上午短程观景",
            detail:
              "只走开放的地面观景区。地热谷周一休园；硫磺谷的地景与泡脚池开放规则分开核对。",
          },
          {
            name: "北投独立汤屋（候选瀧乃汤）",
            mapQuery: "臺北市北投區光明路244號",
            kind: "泡汤",
            period: "午后早场",
            detail:
              "双人独立汤屋需两位成人。瀧乃汤当日06:30开始预约、只开下午；须先确认早场，否则选可提前预约的汤屋，不以晚场硬接高铁。",
          },
          {
            name: "酒店取寄存箱",
            mapQuery: "台北市中正區開封街一段33號",
            kind: "行李",
            period: "乘车前",
            detail:
              "退房时先向柜台确认寄存与取箱安排，回店拿齐行李后再去高铁。",
          },
          {
            name: "高铁台北站",
            mapQuery: "高鐵台北站",
            kind: "换乘",
            period: "下午或傍晚",
            detail:
              "以汤屋结束、取箱和进站时间倒推车次，不写死未经订票确认的时刻。",
          },
          {
            name: "高铁台南站",
            mapQuery: "高鐵台南站",
            kind: "换乘",
            period: "到站后",
            detail: "这里还不在市区。从二楼转乘通廊前往台铁沙仑站。",
          },
          {
            name: "台铁沙仑站",
            mapQuery: "沙崙車站 臺南市",
            kind: "换乘",
            period: "跟随台铁标识",
            detail:
              "查开往台南方向且停靠台南站的列车，别把高铁站当作市区台南站。",
          },
          {
            name: "台铁台南站",
            mapQuery: "臺鐵臺南站",
            kind: "抵达",
            period: "进市区",
            detail: "拖箱、下雨或晚到时在正式乘车点搭车到酒店。",
          },
          {
            name: "康桥台南赤崁楼馆",
            mapQuery: "臺南市中西區民權路二段97號",
            kind: "住宿",
            period: "晚间入住",
            detail: "今天不再赶国华街或夜市；留两晚，明天有完整的旧城时间。",
          },
        ],
        legs: [
          {
            label: "酒店 → 北投地质观景",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E7%A1%AB%E7%A3%BA%E8%B0%B7%E5%9C%B0%E7%86%B1%E6%99%AF%E8%A7%80%E5%8D%80+%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E6%B3%89%E6%BA%90%E8%B7%AF&travelmode=transit",
          },
          {
            label: "地质观景 → 瀧乃汤",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%A1%AB%E7%A3%BA%E8%B0%B7%E5%9C%B0%E7%86%B1%E6%99%AF%E8%A7%80%E5%8D%80+%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E6%B3%89%E6%BA%90%E8%B7%AF&destination=%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E5%85%89%E6%98%8E%E8%B7%AF244%E8%99%9F&travelmode=transit",
          },
          {
            label: "瀧乃汤双人汤屋与当日预约",
            url: "https://www.longnice.com.tw/modules/cadch/room",
          },
          {
            label: "可提前预约的备选：北投丽禧独立汤屋",
            url: "https://www.gvrb.com.tw/service/%E6%B9%AF%E5%B1%8B-2/",
          },
          {
            label: "瀧乃汤 → 酒店取箱",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E5%85%89%E6%98%8E%E8%B7%AF244%E8%99%9F&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
          {
            label: "酒店 → 高铁台北站步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8C%97%E7%AB%99&travelmode=walking",
          },
          {
            label: "高铁台北 → 高铁台南",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8C%97%E7%AB%99&destination=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8D%97%E7%AB%99&travelmode=transit",
          },
          {
            label: "高铁台南 → 沙仑转乘通廊",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8D%97%E7%AB%99&destination=%E6%B2%99%E5%B4%99%E8%BB%8A%E7%AB%99&travelmode=walking",
          },
          {
            label: "沙仑 → 市区台南站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%B2%99%E5%B4%99%E8%BB%8A%E7%AB%99&destination=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&travelmode=transit",
          },
          {
            label: "台南站 → 赤崁楼馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=transit",
          },
          {
            label: "高铁台南站官方转乘说明",
            url: "https://www.thsrc.com.tw/ArticleContent/9c5ac6ca-ec89-48f8-aab0-41b738cb1814",
          },
        ],
        culture: {
          title: "用火山地景补一段户外风景",
          body: "阿里山这次放下，北投仍能看地热、硫气与温泉聚落。观景和泡汤是两件事；留出回酒店取箱及跨城换乘的时间，不再同时加入淡水。",
          source: {
            title: "台北市政府 · 地热谷开放规则",
            url: "https://www.water.gov.taipei/News_Content.aspx?n=20FD034365D9809C&s=CA22DFCC722E6905&sms=87415A8B9CE81B16",
          },
        },
        base: "北投 → 台南",
        pace: "泡汤与移动",
        previewUrl:
          "https://www.google.com/maps/dir/%E7%A1%AB%E7%A3%BA%E8%B0%B7%E5%9C%B0%E7%86%B1%E6%99%AF%E8%A7%80%E5%8D%80%20%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E6%B3%89%E6%BA%90%E8%B7%AF/%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E5%85%89%E6%98%8E%E8%B7%AF244%E8%99%9F/%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F/%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8C%97%E7%AB%99/%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8D%97%E7%AB%99/%E6%B2%99%E5%B4%99%E8%BB%8A%E7%AB%99%20%E8%87%BA%E5%8D%97%E5%B8%82/%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99/%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F/",
        id: 5,
        date: "12/14",
        stay: "台南 · 赤崁楼馆，第1晚",
      },
      {
        name: "把完整一天留给台南",
        route: "国华街／永乐市场 → 午后休息 → 孔庙与府中街 → 神农街可选",
        note: "早午餐只选两三家，慢慢看旧街。孔庙与神农街按体力取舍，不增加安平远端往返；如果是12/11出发版，周三晚可将武圣夜市作为晚餐替换，不叠加。",
        stops: [
          {
            name: "国华街／永乐市场",
            mapQuery: "永樂市場 國華街三段 臺南市",
            kind: "市井",
            period: "早午餐",
            detail: "日间小吃早点吃，各店售完和公休日不同；不要依赖夜里补吃。",
          },
          {
            name: "台南孔庙与府中街",
            mapQuery: "臺南孔廟 南門路2號",
            kind: "文化",
            period: "午后",
            detail:
              "按孔庙现行入园口与票券规则参观，再走附近街巷，不为了凑景点来回跑。",
          },
          {
            name: "神农街（可选）",
            mapQuery: "神農街 臺南市",
            kind: "街区",
            period: "傍晚可选",
            detail: "看街屋、门面与灯光，体力不足就在酒店附近吃饭。",
          },
          {
            name: "康桥台南赤崁楼馆",
            mapQuery: "臺南市中西區民權路二段97號",
            kind: "休息",
            period: "连住第2晚",
            detail: "今天继续住同一家，午后也能回房休息。",
          },
        ],
        legs: [
          {
            label: "酒店 → 国华街早午餐",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4+%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E8%87%BA%E5%8D%97%E5%B8%82&travelmode=walking",
          },
          {
            label: "国华街 → 孔庙",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4+%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E8%87%BA%E5%8D%97%E5%B8%82&destination=%E8%87%BA%E5%8D%97%E5%AD%94%E5%BB%9F+%E5%8D%97%E9%96%80%E8%B7%AF2%E8%99%9F&travelmode=walking",
          },
          {
            label: "台南孔庙现行入口、票价与开放时间",
            url: "https://www.tn-confucius.org.tw/page.asp?orcaid=F1099DC5-EBF9-4B08-8480-CAF71E0EED0C",
          },
          {
            label: "孔庙 → 神农街（可选）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%AD%94%E5%BB%9F&destination=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97%E5%B8%82&travelmode=walking",
          },
          {
            label: "神农街 → 赤崁楼馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97%E5%B8%82&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=walking",
          },
        ],
        culture: {
          title: "街屋、庙口和一顿早饭",
          body: "台南这一天用市场和旧城串起来。想坐下就找一间茶店或咖啡店，把时间留给已经走到的街区；馆内参观与夜市都各留一个备选就够。",
          source: {
            title: "Taiwan Obsessed · 台南旧城",
            url: "https://www.taiwanobsessed.com/tainan-taiwan-guide/",
          },
        },
        base: "台南",
        pace: "完整旧城日",
        previewUrl:
          "https://www.google.com/maps/dir/%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4%20%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5%20%E8%87%BA%E5%8D%97%E5%B8%82/%E8%87%BA%E5%8D%97%E5%AD%94%E5%BB%9F%20%E5%8D%97%E9%96%80%E8%B7%AF2%E8%99%9F/%E7%A5%9E%E8%BE%B2%E8%A1%97%20%E8%87%BA%E5%8D%97%E5%B8%82/%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F/",
        id: 6,
        date: "12/15",
        stay: "台南 · 同一旅馆，第2晚",
      },
      {
        id: 7,
        date: "12/16",
        base: "高雄",
        name: "高雄：盐埕、轮渡与港边",
        route: "台南 → 高雄站前馆寄箱 → 盐埕午餐 → 鼓山 → 旗津 → 驳二可选",
        note: "上午搭台铁南下，先去站前馆寄箱，再选择盐埕、鼓山与旗津。驳二可删；若选田寮月世界地质半日，则替换港区行程，不在同一天叠加。",
        stops: [
          {
            name: "台铁台南站",
            kind: "换乘",
            detail: "早餐后前往市区台铁台南站，核对南下高雄的列车与月台。",
            period: "到站后",
            mapQuery: "臺鐵臺南站",
          },
          {
            name: "康桥高雄站前馆",
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
            mapQuery: "高雄市三民區建國二路295號",
          },
          {
            name: "鼓山渡轮站",
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
            mapQuery: "鼓山輪渡站 高雄市",
          },
          {
            name: "旗津海岸",
            kind: "自然",
            detail: "海岸散步为主，不把冬季日落当成必达打卡。",
            period: "日间优先",
            mapQuery: "旗津海岸公園",
          },
          {
            name: "鼓山渡轮站",
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
            mapQuery: "鼓山輪渡站 高雄市",
          },
          {
            name: "驳二（可删）",
            kind: "文化",
            detail: "旧港仓库和公共艺术可单独逛，疲劳或晚到就删。",
            period: "回程可选",
            mapQuery: "駁二藝術特區 高雄市",
          },
          {
            name: "康桥高雄站前馆",
            kind: "换乘",
            detail: "结束港区活动后回建国二路295号酒店办理入住。",
            period: "晚间回酒店",
            mapQuery: "高雄市三民區建國二路295號",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99/%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F/%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99%20%E9%AB%98%E9%9B%84%E5%B8%82/%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92/%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99%20%E9%AB%98%E9%9B%84%E5%B8%82/%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80%20%E9%AB%98%E9%9B%84%E5%B8%82/%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F/",
        legs: [
          {
            label: "台南站 → 高雄站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&destination=%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "高雄站 → 站前馆寄存",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&destination=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&travelmode=walking",
          },
          {
            label: "站前馆 → 鼓山渡轮站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&destination=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&travelmode=transit",
          },
          {
            label: "鼓山渡轮站 → 旗津渡轮站（查渡轮）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&travelmode=transit",
          },
          {
            label: "旗津码头 → 海岸步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92&travelmode=walking",
          },
          {
            label: "海岸 → 旗津码头步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92&destination=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&travelmode=walking",
          },
          {
            label: "旗津渡轮站 → 鼓山渡轮站（返程）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&travelmode=transit",
          },
          {
            label: "鼓山 → 驳二（可删）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&destination=%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80&travelmode=walking",
          },
          {
            label: "驳二 → 站前馆（回酒店）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "港口、轮渡和旧仓库",
          body: "旗津以渡轮和海岸为主，回程再看驳二旧港仓库改造的街区。两处都能逛很久，天黑或疲劳时删掉其中一处。",
          source: {
            title: "Taiwan Obsessed · 港口与仓库街区",
            url: "https://www.taiwanobsessed.com/kaohsiung-city-taiwan/",
          },
        },
        stay: "高雄 · 站前馆，第1晚",
        pace: "移动日",
      },
      {
        id: 8,
        date: "12/17",
        base: "返港",
        name: "站前馆返程",
        route: "高雄站前馆 → R11高雄车站 → R4高雄国际机场 → 香港",
        note: "只留早餐、收拾行李和机场交通。出发与返程航班尚未订，按实际航空公司报到要求倒推离店时间。",
        stops: [
          {
            name: "康桥高雄站前馆",
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
            mapQuery: "高雄市三民區建國二路295號",
          },
          {
            name: "高雄国际机场",
            kind: "返程",
            detail: "按实际航班报到要求倒推，行李加购和退改在出票前确认。",
            period: "按航班倒推",
            mapQuery: "高雄國際機場",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F/%E9%AB%98%E9%9B%84%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4/",
        legs: [
          {
            label: "站前馆 → R11步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&destination=%E9%AB%98%E9%9B%84%E6%8D%B7%E9%81%8B%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&travelmode=walking",
          },
          {
            label: "R11 → R4机场（红线往小港）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E6%8D%B7%E9%81%8B%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&destination=%E9%AB%98%E9%9B%84%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4&travelmode=transit",
          },
        ],
        culture: {
          title: "把最后一天留给返程",
          body: "早餐、收行李与去机场即可。住在车站附近的便利，体现在不用回程当天再搬一次城。",
          source: {
            title: "Taiwan Obsessed · 港口与仓库街区",
            url: "https://www.taiwanobsessed.com/kaohsiung-city-taiwan/",
          },
        },
        stay: "当天返港",
        pace: "移动日",
      },
    ],
    budget: {
      flight: 1800,
      hotel: 9000,
      food: 5000,
    },
  },
  {
    id: "later",
    label: "8天 · 12/11",
    range: "12/11—12/18 · 出发日候选",
    nights: "台北4晚 · 台南2晚 · 高雄1晚",
    summary:
      "故宫、手作、101登顶、国父园区、象山和独立汤屋都保留；北投安排在南下日。",
    days: [
      {
        id: 1,
        date: "12/11",
        base: "台北",
        name: "抵达与入住",
        route: "桃园机场 → A1 → 开封街酒店 → 宁夏夜市",
        note: "抵达当天只安排入境、交通和入住。宁夏夜市只是酒店附近的晚餐备选，不增加固定活动。",
        stops: [
          {
            name: "桃园国际机场",
            kind: "抵达",
            detail: "下午抵达后先处理入境、现金和交通卡，出站时间留出弹性。",
            period: "抵达后",
            mapQuery: "桃園國際機場",
          },
          {
            name: "台北车站区域",
            kind: "换乘",
            detail:
              "A1、捷运与高铁出口编号不同；机场捷运到店使用A1的5号出口链接。",
            period: "换乘",
            mapQuery: "桃園機場捷運A1台北車站",
          },
          {
            name: "天雲旅棧台北開封分館",
            kind: "住宿",
            detail: "开封街一段33号。先放好行李；到店认分馆名与门牌。",
            period: "先入住",
            mapQuery: "台北市中正區開封街一段33號",
          },
          {
            name: "宁夏夜市",
            kind: "美食",
            detail: "晚餐先选两三样，热门摊位售完时换附近店。",
            period: "晚餐可选",
            mapQuery: "寧夏夜市 台北市",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/%E6%A1%83%E5%9C%92%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4/%E6%A1%83%E5%9C%92%E6%A9%9F%E5%A0%B4%E6%8D%B7%E9%81%8BA1%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%99/%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F/%E5%AF%A7%E5%A4%8F%E5%A4%9C%E5%B8%82%20%E5%8F%B0%E5%8C%97%E5%B8%82/",
        legs: [
          {
            label: "机场 → A1 公共交通",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%A1%83%E5%9C%92%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4&destination=%E6%A1%83%E5%9C%92%E6%A9%9F%E5%A0%B4%E6%8D%B7%E9%81%8B+A1%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "A1 的5号出口 → 酒店步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%A1%83%E5%9C%92%E6%A9%9F%E5%A0%B4%E6%8D%B7%E9%81%8B+A1%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%995%E8%99%9F%E5%87%BA%E5%8F%A3&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=walking",
          },
          {
            label: "酒店 → 宁夏夜市步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%AF%A7%E5%A4%8F%E5%A4%9C%E5%B8%82+%E5%8F%B0%E5%8C%97%E5%B8%82&travelmode=walking",
          },
        ],
        culture: {
          title: "夜市先从小份开始",
          body: "宁夏以小吃为主，第一晚先选两三样，现金准备小额面钞。酒店入住后再决定是否出门，晚到就近用餐。",
          source: {
            title: "台北市旅游网 · 宁夏夜市",
            url: "https://www.travel.taipei/en/attraction/details/1689/",
          },
        },
        stay: "台北 · 开封馆，第1晚",
        pace: "移动日",
      },
      {
        name: "国父纪念馆、101登顶与象山",
        route: "国父纪念馆园区 → 午餐 → 台北101登顶 → 象山开放步道",
        note: "三处都保留：国父纪念馆目前馆体整修，按园区与外观安排；101是真正登观景台。塔上游览放午后较早时段，山上留足日照，晚上不再加夜市。 总统府安排在D4周一，避免周末扑空。",
        stops: [
          {
            name: "国父纪念馆（园区与外观）",
            mapQuery: "國立國父紀念館 臺北市",
            kind: "建筑",
            period: "上午",
            detail:
              "馆体目前整修中，能否入馆按最新开放公告；园区通道也按现场围挡走。",
          },
          {
            name: "台北101观景台·登顶",
            mapQuery: "台北101觀景台",
            kind: "城市风景",
            period: "午后较早时段",
            detail:
              "预约实际可用的观景台时段，计入排队与安检；不要把塔上日落票和象山日落同时设成固定目标。",
          },
          {
            name: "象山灵云宫登山口",
            mapQuery: "象山步道靈雲宮登山口 臺北市",
            kind: "步道",
            period: "下午看天气",
            detail:
              "步道部分路段施工。Google导航只到登山口，山上按官方开放图走；观景后原路或按开放路线返回。",
          },
        ],
        legs: [
          {
            label: "酒店 → 国父纪念馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%8B%E7%AB%8B%E5%9C%8B%E7%88%B6%E7%B4%80%E5%BF%B5%E9%A4%A8&travelmode=transit",
          },
          {
            label: "国父纪念馆 → 101步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%9C%8B%E7%AB%8B%E5%9C%8B%E7%88%B6%E7%B4%80%E5%BF%B5%E9%A4%A8&destination=%E5%8F%B0%E5%8C%97101&travelmode=walking",
          },
          {
            label: "101观景台与预约",
            url: "https://www.taipei-101.com.tw/",
          },
          {
            label: "101 → 象山登山口步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97101&destination=%E8%B1%A1%E5%B1%B1%E6%AD%A5%E9%81%93%E9%9D%88%E9%9B%B2%E5%AE%AE%E7%99%BB%E5%B1%B1%E5%8F%A3&travelmode=walking",
          },
          {
            label: "象山部分路段工程公告",
            url: "https://www.gov.taipei/News_Content.aspx?n=D0042A87C2F0270A&s=8826D23D548E4171",
          },
          {
            label: "象山登山口 → 酒店",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%B1%A1%E5%B1%B1%E6%AD%A5%E9%81%93%E9%9D%88%E9%9B%B2%E5%AE%AE%E7%99%BB%E5%B1%B1%E5%8F%A3&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "把信义区留成一天",
          body: "从纪念建筑到高楼，再到山坡上的城市视角，地点虽近，登观景台和走石阶都需要时间。这一天只围绕信义区走，雨天保留101，象山按天气和开放情况调整。",
          source: {
            title: "台北旅游网 · 国父纪念馆现况",
            url: "https://www.travel.taipei/zh-tw/attraction/details/24",
          },
        },
        base: "台北",
        pace: "城市与山景",
        previewUrl:
          "https://www.google.com/maps/dir/%E5%9C%8B%E7%AB%8B%E5%9C%8B%E7%88%B6%E7%B4%80%E5%BF%B5%E9%A4%A8%20%E8%87%BA%E5%8C%97%E5%B8%82/%E5%8F%B0%E5%8C%97101%E8%A7%80%E6%99%AF%E5%8F%B0/%E8%B1%A1%E5%B1%B1%E6%AD%A5%E9%81%93%E9%9D%88%E9%9B%B2%E5%AE%AE%E7%99%BB%E5%B1%B1%E5%8F%A3%20%E8%87%BA%E5%8C%97%E5%B8%82/",
        id: 2,
        date: "12/12",
        stay: "台北 · 开封馆，第2晚",
      },
      {
        name: "故宫与亲手做凤梨酥",
        route: "故宫入馆 → 士林午餐 → 郭元益凤梨酥DIY → 回酒店",
        note: "故宫正式保留。上午看重点展厅；下午为手作课预留两小时，两处之间需要乘车。14:00–16:00只是候选排法，按12月实际可订课次调整。",
        stops: [
          {
            name: "国立故宫博物院",
            mapQuery: "國立故宮博物院 臺北市",
            kind: "文化",
            period: "上午入馆",
            detail:
              "预留约三小时，先选想看的展厅与展品；不在同一上午排热门早餐长队。",
          },
          {
            name: "郭元益士林馆·凤梨酥DIY",
            mapQuery: "臺北市士林區文林路546號",
            kind: "手作",
            period: "下午预约课",
            detail:
              "地址在文林路546号四楼，按订单提前报到。12岁以上参加者各自报名，不默认有免费陪同名额。",
          },
          {
            name: "天雲旅棧台北開封分館",
            mapQuery: "台北市中正區開封街一段33號",
            kind: "休息",
            period: "结束后回店",
            detail:
              "故宫与手作已是完整的一天，晚餐就近；饶河只在前一天未去且有体力时补。",
          },
        ],
        legs: [
          {
            label: "酒店 → 故宫",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2+%E8%87%BA%E5%8C%97%E5%B8%82&travelmode=transit",
          },
          {
            label: "故宫开放与展览",
            url: "https://www.npm.gov.tw/",
          },
          {
            label: "故宫 → 郭元益士林馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2+%E8%87%BA%E5%8C%97%E5%B8%82&destination=%E8%87%BA%E5%8C%97%E5%B8%82%E5%A3%AB%E6%9E%97%E5%8D%80%E6%96%87%E6%9E%97%E8%B7%AF546%E8%99%9F&travelmode=transit",
          },
          {
            label: "凤梨酥课程介绍（已选项目）",
            url: "https://www.kuos.com/zh-TW/pages/pineapple-cake-diy-introduction",
          },
          {
            label: "郭元益官方课程预约",
            url: "https://www.kuos.com/zh-TW/pages/handcraft-course",
          },
          {
            label: "郭元益士林馆 → 酒店",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8C%97%E5%B8%82%E5%A3%AB%E6%9E%97%E5%8D%80%E6%96%87%E6%9E%97%E8%B7%AF546%E8%99%9F&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "把展览和手作各留半天",
          body: "这一天围绕士林安排。故宫看文物，下午自己揉面、包馅、烘烤和包装，留出吃饭和换乘时间，不再跨城追一串景点。",
          source: {
            title: "郭元益 · 课程说明",
            url: "https://www.kuos.com/zh-TW/pages/pineapple-cake-diy-introduction",
          },
        },
        base: "台北",
        pace: "文化与手作",
        previewUrl:
          "https://www.google.com/maps/dir/%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2%20%E8%87%BA%E5%8C%97%E5%B8%82/%E8%87%BA%E5%8C%97%E5%B8%82%E5%A3%AB%E6%9E%97%E5%8D%80%E6%96%87%E6%9E%97%E8%B7%AF546%E8%99%9F/%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F/",
        id: 3,
        date: "12/13",
        stay: "台北 · 开封馆，第3晚",
      },
      {
        name: "从早市走进老台北",
        route: "东三水早市 → 龙山寺 → 总统府 → 中正纪念堂可选 → 饶河晚餐可选",
        note: "市场早点去；以09:30前后到总统府排队为目标，11:30前最后入府。午后留休息时间，中正纪念堂可删，饶河只选两三样。",
        stops: [
          {
            name: "东三水街市场",
            mapQuery: "東三水街市場 台北市萬華區三水街",
            kind: "市井",
            period: "早上早餐",
            detail:
              "官方资料列07:00–12:00，先看实际出摊；旁边的新富市场是另一处市场，周一休市规则不同。",
          },
          {
            name: "艋舺龙山寺",
            mapQuery: "艋舺龍山寺 臺北市萬華區廣州街211號",
            kind: "信仰",
            period: "早餐后",
            detail: "看建筑、香火和往来的日常，按现场动线参观，不挡参拜通道。",
          },
          {
            name: "总统府参观三号门",
            mapQuery: "總統府三號門 寶慶路 博愛路 臺北市",
            kind: "历史",
            period: "上午入府",
            detail:
              "个人少于15人无需预约，携带有照片的身份证件，经安检入内；入口在宝庆路与博爱路口。",
          },
          {
            name: "中正纪念堂（可选）",
            mapQuery: "中正紀念堂 臺北市",
            kind: "建筑",
            period: "午后可选",
            detail: "留给建筑和广场，累了就回住宿休息，不再强制参观每个展厅。",
          },
          {
            name: "饶河街夜市（晚餐可选）",
            mapQuery: "饒河街觀光夜市 臺北市",
            kind: "美食",
            period: "晚上二选一",
            detail:
              "和酒店附近晚餐二选一；若上午走累，可挪到手作课那天，信义区爬山当天不再叠加夜市。",
          },
        ],
        legs: [
          {
            label: "酒店 → 东三水市场",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E6%9D%B1%E4%B8%89%E6%B0%B4%E8%A1%97%E5%B8%82%E5%A0%B4&travelmode=transit",
          },
          {
            label: "东三水 → 龙山寺步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%9D%B1%E4%B8%89%E6%B0%B4%E8%A1%97%E5%B8%82%E5%A0%B4&destination=%E8%89%8B%E8%88%BA%E9%BE%8D%E5%B1%B1%E5%AF%BA&travelmode=walking",
          },
          {
            label: "龙山寺 → 总统府三号门",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%89%8B%E8%88%BA%E9%BE%8D%E5%B1%B1%E5%AF%BA&destination=%E7%B8%BD%E7%B5%B1%E5%BA%9C%E4%B8%89%E8%99%9F%E9%96%80+%E5%AF%B6%E6%85%B6%E8%B7%AF+%E5%8D%9A%E6%84%9B%E8%B7%AF&travelmode=transit",
          },
          {
            label: "总统府开放时段与证件说明",
            url: "https://www.president.gov.tw/Page/124",
          },
          {
            label: "总统府 → 中正纪念堂（可选）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%B8%BD%E7%B5%B1%E5%BA%9C%E4%B8%89%E8%99%9F%E9%96%80+%E5%AF%B6%E6%85%B6%E8%B7%AF+%E5%8D%9A%E6%84%9B%E8%B7%AF&destination=%E4%B8%AD%E6%AD%A3%E7%B4%80%E5%BF%B5%E5%A0%82&travelmode=transit",
          },
          {
            label: "酒店 → 饶河夜市（晚餐可选）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E9%A5%92%E6%B2%B3%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82&travelmode=transit",
          },
          {
            label: "饶河 → 酒店",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%A5%92%E6%B2%B3%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "先吃一顿市场早餐",
          body: "把市场、寺庙与老城放在同一天，能看到摊位开张、街坊买菜和参拜的生活。总统府参观守住上午窗口，其余时间给街区和休息。",
          source: {
            title: "台北旅游网 · 东三水市场",
            url: "https://travel.taipei/zh-tw/attraction/details/2173",
          },
        },
        base: "台北",
        pace: "街区日",
        previewUrl:
          "https://www.google.com/maps/dir/%E6%9D%B1%E4%B8%89%E6%B0%B4%E8%A1%97%E5%B8%82%E5%A0%B4%20%E5%8F%B0%E5%8C%97%E5%B8%82%E8%90%AC%E8%8F%AF%E5%8D%80%E4%B8%89%E6%B0%B4%E8%A1%97/%E8%89%8B%E8%88%BA%E9%BE%8D%E5%B1%B1%E5%AF%BA%20%E8%87%BA%E5%8C%97%E5%B8%82%E8%90%AC%E8%8F%AF%E5%8D%80%E5%BB%A3%E5%B7%9E%E8%A1%97211%E8%99%9F/%E7%B8%BD%E7%B5%B1%E5%BA%9C%E4%B8%89%E8%99%9F%E9%96%80%20%E5%AF%B6%E6%85%B6%E8%B7%AF%20%E5%8D%9A%E6%84%9B%E8%B7%AF%20%E8%87%BA%E5%8C%97%E5%B8%82/%E4%B8%AD%E6%AD%A3%E7%B4%80%E5%BF%B5%E5%A0%82%20%E8%87%BA%E5%8C%97%E5%B8%82/%E9%A5%92%E6%B2%B3%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82%20%E8%87%BA%E5%8C%97%E5%B8%82/",
        id: 4,
        date: "12/14",
        stay: "台北 · 开封馆，第4晚",
      },
      {
        name: "北投地热与私汤，之后南下台南",
        route:
          "酒店退房寄箱 → 地热谷 → 独立汤屋 → 取箱 → 高铁台南 → 沙仑 → 台南入住",
        note: "今天先在台北酒店退房寄箱，北投只排地质观景和独立汤屋。汤屋时段确认后再配高铁，泡完回酒店取箱，傍晚或晚间到台南；到店后只吃饭、休息。",
        stops: [
          {
            name: "地热谷",
            mapQuery: "地熱谷 臺北市北投區",
            kind: "地质",
            period: "上午短程观景",
            detail:
              "只走开放的地面观景区。地热谷周一休园；硫磺谷的地景与泡脚池开放规则分开核对。",
          },
          {
            name: "北投独立汤屋（候选瀧乃汤）",
            mapQuery: "臺北市北投區光明路244號",
            kind: "泡汤",
            period: "午后早场",
            detail:
              "双人独立汤屋需两位成人。瀧乃汤当日06:30开始预约、只开下午；须先确认早场，否则选可提前预约的汤屋，不以晚场硬接高铁。",
          },
          {
            name: "酒店取寄存箱",
            mapQuery: "台北市中正區開封街一段33號",
            kind: "行李",
            period: "乘车前",
            detail:
              "退房时先向柜台确认寄存与取箱安排，回店拿齐行李后再去高铁。",
          },
          {
            name: "高铁台北站",
            mapQuery: "高鐵台北站",
            kind: "换乘",
            period: "下午或傍晚",
            detail:
              "以汤屋结束、取箱和进站时间倒推车次，不写死未经订票确认的时刻。",
          },
          {
            name: "高铁台南站",
            mapQuery: "高鐵台南站",
            kind: "换乘",
            period: "到站后",
            detail: "这里还不在市区。从二楼转乘通廊前往台铁沙仑站。",
          },
          {
            name: "台铁沙仑站",
            mapQuery: "沙崙車站 臺南市",
            kind: "换乘",
            period: "跟随台铁标识",
            detail:
              "查开往台南方向且停靠台南站的列车，别把高铁站当作市区台南站。",
          },
          {
            name: "台铁台南站",
            mapQuery: "臺鐵臺南站",
            kind: "抵达",
            period: "进市区",
            detail: "拖箱、下雨或晚到时在正式乘车点搭车到酒店。",
          },
          {
            name: "康桥台南赤崁楼馆",
            mapQuery: "臺南市中西區民權路二段97號",
            kind: "住宿",
            period: "晚间入住",
            detail: "今天不再赶国华街或夜市；留两晚，明天有完整的旧城时间。",
          },
        ],
        legs: [
          {
            label: "酒店 → 北投地质观景",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%B0%E7%86%B1%E8%B0%B7+%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80&travelmode=transit",
          },
          {
            label: "地质观景 → 瀧乃汤",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%9C%B0%E7%86%B1%E8%B0%B7+%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80&destination=%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E5%85%89%E6%98%8E%E8%B7%AF244%E8%99%9F&travelmode=transit",
          },
          {
            label: "瀧乃汤双人汤屋与当日预约",
            url: "https://www.longnice.com.tw/modules/cadch/room",
          },
          {
            label: "可提前预约的备选：北投丽禧独立汤屋",
            url: "https://www.gvrb.com.tw/service/%E6%B9%AF%E5%B1%8B-2/",
          },
          {
            label: "瀧乃汤 → 酒店取箱",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E5%85%89%E6%98%8E%E8%B7%AF244%E8%99%9F&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
          {
            label: "酒店 → 高铁台北站步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8C%97%E7%AB%99&travelmode=walking",
          },
          {
            label: "高铁台北 → 高铁台南",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8C%97%E7%AB%99&destination=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8D%97%E7%AB%99&travelmode=transit",
          },
          {
            label: "高铁台南 → 沙仑转乘通廊",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8D%97%E7%AB%99&destination=%E6%B2%99%E5%B4%99%E8%BB%8A%E7%AB%99&travelmode=walking",
          },
          {
            label: "沙仑 → 市区台南站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%B2%99%E5%B4%99%E8%BB%8A%E7%AB%99&destination=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&travelmode=transit",
          },
          {
            label: "台南站 → 赤崁楼馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=transit",
          },
          {
            label: "高铁台南站官方转乘说明",
            url: "https://www.thsrc.com.tw/ArticleContent/9c5ac6ca-ec89-48f8-aab0-41b738cb1814",
          },
        ],
        culture: {
          title: "用火山地景补一段户外风景",
          body: "阿里山这次放下，北投仍能看地热、硫气与温泉聚落。观景和泡汤是两件事；留出回酒店取箱及跨城换乘的时间，不再同时加入淡水。",
          source: {
            title: "台北市政府 · 地热谷开放规则",
            url: "https://www.water.gov.taipei/News_Content.aspx?n=20FD034365D9809C&s=CA22DFCC722E6905&sms=87415A8B9CE81B16",
          },
        },
        base: "北投 → 台南",
        pace: "泡汤与移动",
        previewUrl:
          "https://www.google.com/maps/dir/%E5%9C%B0%E7%86%B1%E8%B0%B7%20%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80/%E8%87%BA%E5%8C%97%E5%B8%82%E5%8C%97%E6%8A%95%E5%8D%80%E5%85%89%E6%98%8E%E8%B7%AF244%E8%99%9F/%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F/%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8C%97%E7%AB%99/%E9%AB%98%E9%90%B5%E5%8F%B0%E5%8D%97%E7%AB%99/%E6%B2%99%E5%B4%99%E8%BB%8A%E7%AB%99%20%E8%87%BA%E5%8D%97%E5%B8%82/%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99/%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F/",
        id: 5,
        date: "12/15",
        stay: "台南 · 赤崁楼馆，第1晚",
      },
      {
        name: "把完整一天留给台南",
        route: "国华街／永乐市场 → 午后休息 → 孔庙与府中街 → 神农街可选",
        note: "早午餐只选两三家，慢慢看旧街。孔庙与神农街按体力取舍，不增加安平远端往返；如果是12/11出发版，周三晚可将武圣夜市作为晚餐替换，不叠加。",
        stops: [
          {
            name: "国华街／永乐市场",
            mapQuery: "永樂市場 國華街三段 臺南市",
            kind: "市井",
            period: "早午餐",
            detail: "日间小吃早点吃，各店售完和公休日不同；不要依赖夜里补吃。",
          },
          {
            name: "台南孔庙与府中街",
            mapQuery: "臺南孔廟 南門路2號",
            kind: "文化",
            period: "午后",
            detail:
              "按孔庙现行入园口与票券规则参观，再走附近街巷，不为了凑景点来回跑。",
          },
          {
            name: "神农街（可选）",
            mapQuery: "神農街 臺南市",
            kind: "街区",
            period: "傍晚可选",
            detail: "看街屋、门面与灯光，体力不足就在酒店附近吃饭。",
          },
          {
            name: "康桥台南赤崁楼馆",
            mapQuery: "臺南市中西區民權路二段97號",
            kind: "休息",
            period: "连住第2晚",
            detail: "今天继续住同一家，午后也能回房休息。",
          },
        ],
        legs: [
          {
            label: "酒店 → 国华街早午餐",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4+%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E8%87%BA%E5%8D%97%E5%B8%82&travelmode=walking",
          },
          {
            label: "国华街 → 孔庙",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4+%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E8%87%BA%E5%8D%97%E5%B8%82&destination=%E8%87%BA%E5%8D%97%E5%AD%94%E5%BB%9F+%E5%8D%97%E9%96%80%E8%B7%AF2%E8%99%9F&travelmode=walking",
          },
          {
            label: "台南孔庙现行入口、票价与开放时间",
            url: "https://www.tn-confucius.org.tw/page.asp?orcaid=F1099DC5-EBF9-4B08-8480-CAF71E0EED0C",
          },
          {
            label: "孔庙 → 神农街（可选）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%AD%94%E5%BB%9F&destination=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97%E5%B8%82&travelmode=walking",
          },
          {
            label: "神农街 → 赤崁楼馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97%E5%B8%82&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=walking",
          },
        ],
        culture: {
          title: "街屋、庙口和一顿早饭",
          body: "台南这一天用市场和旧城串起来。想坐下就找一间茶店或咖啡店，把时间留给已经走到的街区；馆内参观与夜市都各留一个备选就够。",
          source: {
            title: "Taiwan Obsessed · 台南旧城",
            url: "https://www.taiwanobsessed.com/tainan-taiwan-guide/",
          },
        },
        base: "台南",
        pace: "完整旧城日",
        previewUrl:
          "https://www.google.com/maps/dir/%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4%20%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5%20%E8%87%BA%E5%8D%97%E5%B8%82/%E8%87%BA%E5%8D%97%E5%AD%94%E5%BB%9F%20%E5%8D%97%E9%96%80%E8%B7%AF2%E8%99%9F/%E7%A5%9E%E8%BE%B2%E8%A1%97%20%E8%87%BA%E5%8D%97%E5%B8%82/%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F/",
        id: 6,
        date: "12/16",
        stay: "台南 · 同一旅馆，第2晚",
      },
      {
        id: 7,
        date: "12/17",
        base: "高雄",
        name: "高雄：盐埕、轮渡与港边",
        route: "台南 → 高雄站前馆寄箱 → 盐埕午餐 → 鼓山 → 旗津 → 驳二可选",
        note: "上午搭台铁南下，先去站前馆寄箱，再选择盐埕、鼓山与旗津。驳二可删；若选田寮月世界地质半日，则替换港区行程，不在同一天叠加。",
        stops: [
          {
            name: "台铁台南站",
            kind: "换乘",
            detail: "早餐后前往市区台铁台南站，核对南下高雄的列车与月台。",
            period: "到站后",
            mapQuery: "臺鐵臺南站",
          },
          {
            name: "康桥高雄站前馆",
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
            mapQuery: "高雄市三民區建國二路295號",
          },
          {
            name: "鼓山渡轮站",
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
            mapQuery: "鼓山輪渡站 高雄市",
          },
          {
            name: "旗津海岸",
            kind: "自然",
            detail: "海岸散步为主，不把冬季日落当成必达打卡。",
            period: "日间优先",
            mapQuery: "旗津海岸公園",
          },
          {
            name: "鼓山渡轮站",
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
            mapQuery: "鼓山輪渡站 高雄市",
          },
          {
            name: "驳二（可删）",
            kind: "文化",
            detail: "旧港仓库和公共艺术可单独逛，疲劳或晚到就删。",
            period: "回程可选",
            mapQuery: "駁二藝術特區 高雄市",
          },
          {
            name: "康桥高雄站前馆",
            kind: "换乘",
            detail: "结束港区活动后回建国二路295号酒店办理入住。",
            period: "晚间回酒店",
            mapQuery: "高雄市三民區建國二路295號",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99/%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F/%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99%20%E9%AB%98%E9%9B%84%E5%B8%82/%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92/%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99%20%E9%AB%98%E9%9B%84%E5%B8%82/%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80%20%E9%AB%98%E9%9B%84%E5%B8%82/%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F/",
        legs: [
          {
            label: "台南站 → 高雄站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&destination=%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "高雄站 → 站前馆寄存",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&destination=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&travelmode=walking",
          },
          {
            label: "站前馆 → 鼓山渡轮站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&destination=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&travelmode=transit",
          },
          {
            label: "鼓山渡轮站 → 旗津渡轮站（查渡轮）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&travelmode=transit",
          },
          {
            label: "旗津码头 → 海岸步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92&travelmode=walking",
          },
          {
            label: "海岸 → 旗津码头步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92&destination=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&travelmode=walking",
          },
          {
            label: "旗津渡轮站 → 鼓山渡轮站（返程）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E6%97%97%E6%B4%A5%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99+%E9%AB%98%E9%9B%84%E5%B8%82&travelmode=transit",
          },
          {
            label: "鼓山 → 驳二（可删）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&destination=%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80&travelmode=walking",
          },
          {
            label: "驳二 → 站前馆（回酒店）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80+%E9%AB%98%E9%9B%84%E5%B8%82&destination=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "港口、轮渡和旧仓库",
          body: "旗津以渡轮和海岸为主，回程再看驳二旧港仓库改造的街区。两处都能逛很久，天黑或疲劳时删掉其中一处。",
          source: {
            title: "Taiwan Obsessed · 港口与仓库街区",
            url: "https://www.taiwanobsessed.com/kaohsiung-city-taiwan/",
          },
        },
        stay: "高雄 · 站前馆，第1晚",
        pace: "移动日",
      },
      {
        id: 8,
        date: "12/18",
        base: "返港",
        name: "站前馆返程",
        route: "高雄站前馆 → R11高雄车站 → R4高雄国际机场 → 香港",
        note: "只留早餐、收拾行李和机场交通。出发与返程航班尚未订，按实际航空公司报到要求倒推离店时间。",
        stops: [
          {
            name: "康桥高雄站前馆",
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
            mapQuery: "高雄市三民區建國二路295號",
          },
          {
            name: "高雄国际机场",
            kind: "返程",
            detail: "按实际航班报到要求倒推，行李加购和退改在出票前确认。",
            period: "按航班倒推",
            mapQuery: "高雄國際機場",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F/%E9%AB%98%E9%9B%84%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4/",
        legs: [
          {
            label: "站前馆 → R11步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E5%B8%82%E4%B8%89%E6%B0%91%E5%8D%80%E5%BB%BA%E5%9C%8B%E4%BA%8C%E8%B7%AF295%E8%99%9F&destination=%E9%AB%98%E9%9B%84%E6%8D%B7%E9%81%8B%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&travelmode=walking",
          },
          {
            label: "R11 → R4机场（红线往小港）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%9B%84%E6%8D%B7%E9%81%8B%E9%AB%98%E9%9B%84%E8%BB%8A%E7%AB%99&destination=%E9%AB%98%E9%9B%84%E5%9C%8B%E9%9A%9B%E6%A9%9F%E5%A0%B4&travelmode=transit",
          },
        ],
        culture: {
          title: "把最后一天留给返程",
          body: "早餐、收行李与去机场即可。住在车站附近的便利，体现在不用回程当天再搬一次城。",
          source: {
            title: "Taiwan Obsessed · 港口与仓库街区",
            url: "https://www.taiwanobsessed.com/kaohsiung-city-taiwan/",
          },
        },
        stay: "当天返港",
        pace: "移动日",
      },
    ],
    budget: {
      flight: 1800,
      hotel: 9000,
      food: 5000,
    },
  },
];
export const taiwanDays = taiwanPlans[0].days;
