export interface TaiwanStop {
  name: string;
  xy: [number, number];
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
// Approximate user-supplied planning points; address-based links locate actual entrances.
// No hotel-door coordinate is invented for the Kaohsiung station-area marker.
export const taiwanPlans: TaiwanPlan[] = [
  {
    id: "comfort",
    label: "9天舒适版",
    range: "12/15—12/23 · 示例日期",
    nights: "台北3晚 · 阿里山2晚 · 台南2晚 · 高雄1晚",
    summary: "多住两晚，把日出、下山与旧城游览分开。",
    days: [
      {
        id: 1,
        date: "12/15",
        base: "台北",
        name: "抵达与入住",
        route: "桃园机场 → A1 → 开封街酒店 → 宁夏夜市",
        note: "入住与晚餐为主，夜市只选两三样；图中车站点为区域示意，找出口使用步行导航。",
        stops: [
          {
            name: "桃园国际机场",
            xy: [121.2342, 25.0797],
            kind: "抵达",
            detail: "下午抵达后先处理入境、现金和交通卡，出站时间留出弹性。",
            period: "抵达后",
          },
          {
            name: "台北车站区域",
            xy: [121.517, 25.0478],
            kind: "换乘",
            detail:
              "A1、捷运与高铁出口编号不同；机场捷运到店使用A1的5号出口链接。",
            period: "换乘",
          },
          {
            name: "天云开封分馆（位置示意）",
            xy: [121.5126, 25.0462],
            kind: "住宿",
            detail:
              "开封街一段33号。先放好行李；本点位只示意街区，到店认门牌。",
            period: "先入住",
          },
          {
            name: "宁夏夜市",
            xy: [121.5153, 25.0558],
            kind: "美食",
            detail: "晚餐先选两三样，热门摊位售完时换附近店。",
            period: "晚餐可选",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Taiwan+Taoyuan+International+Airport/Taipei+Main+Station/Tango+Inn+Taipei+Kaifeng/Ningxia+Night+Market/",
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
        id: 2,
        date: "12/16",
        base: "台北",
        name: "故宫与临江街",
        route: "故宫 → 中山／赤峰街 → 101 → 临江街夜市",
        note: "中山或101登顶可删一项；夜市后搭红线返回台北车站。",
        stops: [
          {
            name: "天云开封分馆（位置示意）",
            xy: [121.5126, 25.0462],
            kind: "住宿",
            detail: "在酒店或附近吃早餐，先去故宫，不额外排热门早餐店。",
            period: "早餐后出门",
          },
          {
            name: "故宫",
            xy: [121.5485, 25.1024],
            kind: "文化",
            detail:
              "选重点展厅，不把所有展馆都塞进一个上午。早餐在酒店周边解决。",
            period: "上午",
          },
          {
            name: "中山／赤峰街",
            xy: [121.5204, 25.0527],
            kind: "街区",
            detail: "午餐、咖啡与小店留作休息段，体力不足时缩短。",
            period: "午后",
          },
          {
            name: "台北101",
            xy: [121.5645, 25.0339],
            kind: "城市",
            detail: "观景台可选；能见度差时只在周边散步。",
            period: "傍晚可选",
          },
          {
            name: "临江街夜市",
            xy: [121.5543, 25.0303],
            kind: "美食",
            detail: "留在信义、大安一侧吃晚饭，再搭红线回台北车站。",
            period: "晚餐",
          },
          {
            name: "天云开封分馆（位置示意）",
            xy: [121.5126, 25.0462],
            kind: "住宿",
            detail: "夜市后搭红线回台北车站，再步行回开封街一段33号。",
            period: "晚间回酒店",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Tango+Inn+Taipei+Kaifeng/National+Palace+Museum/Zhongshan+Station+Taipei/Taipei+101/Linjiang+Street+Night+Market/Tango+Inn+Taipei+Kaifeng/",
        legs: [
          {
            label: "酒店 → 故宫公共交通",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2+%E5%8F%B0%E5%8C%97&travelmode=transit",
          },
          {
            label: "101 → 临江街夜市步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97101&destination=%E8%87%A8%E6%B1%9F%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82+%E5%8F%B0%E5%8C%97&travelmode=walking",
          },
          {
            label: "临江街 → 酒店公共交通",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%A8%E6%B1%9F%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82+%E5%8F%B0%E5%8C%97&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "从器物到街区",
          body: "故宫看展之后，给中山的巷子留一点时间；到信义区再看城市尺度的变化。临江街的晚餐与101同在这一侧，少一次跨城折返。",
          source: {
            title: "Taiwanderers · 信义区街区指南",
            url: "https://taiwanderers.com/xinyi-taipei-things-to-do/",
          },
        },
        stay: "台北 · 开封馆，第2晚",
        pace: "街区与游览",
      },
      {
        id: 3,
        date: "12/17",
        base: "台北",
        name: "北海岸与雨备",
        route: "台北 → 野柳 → 十分 → 九份 → 台北",
        note: "主线为一日团地点顺序。雨天自助先删野柳：瑞芳 → 十分 → 返回瑞芳 → 九份；严重天气改室内。",
        stops: [
          {
            name: "台北车站区域（集合点依订单）",
            xy: [121.517, 25.0478],
            kind: "集合",
            detail:
              "点位只示意台北车站区域；一日团集合位置、时刻以自己的订单为准。",
            period: "早上",
          },
          {
            name: "野柳",
            xy: [121.6899, 25.2061],
            kind: "自然",
            detail: "暴雨、强风时删除，跟团时先确认取消和换日条件。",
            period: "随团时段",
          },
          {
            name: "十分",
            xy: [121.7764, 25.0427],
            kind: "街区",
            detail: "老街和瀑布按交通时间取舍；天灯是自选活动。",
            period: "随团时段",
          },
          {
            name: "九份",
            xy: [121.8452, 25.1099],
            kind: "文化",
            detail: "基山街进、竖崎路看石阶和茶馆，回程记住原集合点。",
            period: "傍晚",
          },
          {
            name: "台北车站区域（返城示意）",
            xy: [121.517, 25.0478],
            kind: "换乘",
            detail: "按一日团实际解散位置回酒店；自助游另查末班铁路与公车。",
            period: "返城后",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Taipei+Main+Station/Yehliu+Geopark/Shifen+Old+Street/Jiufen+Old+Street/Taipei+Main+Station/",
        legs: [
          {
            label: "台北 → 瑞芳（雨备）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%99&destination=%E7%91%9E%E8%8A%B3%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "瑞芳 → 十分（原路返回瑞芳再转九份）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%91%9E%E8%8A%B3%E8%BB%8A%E7%AB%99&destination=%E5%8D%81%E5%88%86%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "瑞芳 → 九份（雨备）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%91%9E%E8%8A%B3%E8%BB%8A%E7%AB%99&destination=%E4%B9%9D%E4%BB%BD%E8%80%81%E8%A1%97&travelmode=transit",
          },
        ],
        culture: {
          title: "九份不只是一张灯笼照片",
          body: "基山街找小吃，竖崎路看石阶与老戏院，天气好再选茶馆坐坐。芋圆、草仔粿和茶是沿途选择，不必把每一家名店都排成任务。",
          source: {
            title: "Taiwanderers · 九份茶馆与老街",
            url: "https://taiwanderers.com/jiufen-taiwan-guide/",
          },
        },
        stay: "台北 · 开封馆，第3晚",
        pace: "街区与游览",
      },
      {
        id: 4,
        date: "12/18",
        base: "阿里山",
        name: "轻装上山，留一段森林",
        route: "台北高铁 → 高铁嘉义站 → 7329 → 阿里山转运站",
        note: "优先查09:30上山的实际班次；高铁按到嘉义的时间倒推。10:10为备选并核对路线后缀。16:00前结束步道，晚上早点休息。",
        stops: [
          {
            name: "高铁台北站",
            xy: [121.517, 25.0478],
            kind: "换乘",
            detail:
              "从酒店前往高铁站，核对车次月台；按嘉义客运时间倒推高铁抵达时间。",
            period: "早上",
          },
          {
            name: "高铁嘉义站",
            xy: [120.3232, 23.4595],
            kind: "换乘",
            detail: "2号出口查阿里山线候车点，按票券核对月台与班次。",
            period: "预订车次",
          },
          {
            name: "阿里山转运站",
            xy: [120.8037, 23.5101],
            kind: "换乘",
            detail: "这里是客运到达点，与森林铁路车站不同；住宿仍待确认。",
            period: "午后抵达",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Taipei+Main+Station/THSR+Chiayi+Station/Alishan+Bus+Station/",
        legs: [
          {
            label: "台北 → 高铁嘉义站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E9%AB%98%E9%90%B5%E7%AB%99&destination=%E9%AB%98%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&travelmode=transit",
          },
          {
            label: "高铁嘉义站 → 阿里山（核对7329）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&destination=%E9%98%BF%E9%87%8C%E5%B1%B1%E8%BD%89%E9%81%8B%E7%AB%99&travelmode=transit",
          },
        ],
        culture: {
          title: "先认识森林，再追日出",
          body: "阿里山的车站、步道和林间列车适合分开看。到达日先放包，选短路线；长途上山之后不再安排完整徒步。",
          source: {
            title: "Taiwan Obsessed · 阿里山指南",
            url: "https://www.taiwanobsessed.com/alishan-guide/",
          },
        },
        stay: "阿里山 · 待选旅馆，第1晚",
        pace: "移动日",
      },
      {
        id: 5,
        date: "12/19",
        base: "阿里山",
        name: "日出之后，再住一晚",
        route: "祝山观日 → 回住宿早餐、休息 → 沼平／神木短步道 → 阿里山住宿",
        note: "今天不退房、不下山。日出天气差或睡眠不足时取消观日，下午只走一段开放步道。",
        stops: [
          {
            name: "祝山观日区",
            xy: [120.8186, 23.5117],
            kind: "自然",
            detail: "发车时间前一天下午公告，网上订票另有中午截止时间。",
            period: "按观日公告",
          },
          {
            name: "阿里山车站／住宿区域",
            xy: [120.8037, 23.5101],
            kind: "休息",
            detail: "观日回来早餐和补眠；下午按天气与开放情况走短步道。",
            period: "留在山上",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Alishan+Forest+Railway+Station/Zhushan+Sunrise+Observation+Deck/Alishan+Forest+Railway+Station/",
        legs: [
          {
            label: "祝山列车公告、车票与取票",
            url: "https://afrts.forest.gov.tw/TI01_2.aspx",
          },
          {
            label: "园区步道与开放信息",
            url: "https://recreation.forest.gov.tw/",
          },
        ],
        culture: {
          title: "给天气一次机会",
          body: "多住一晚，让清晨观日与下山赶车分开。看完日出可以回去休息；没有日出也保留一整天看森林，不为一张照片压缩睡眠。",
          source: {
            title: "Taiwan Obsessed · 阿里山指南",
            url: "https://www.taiwanobsessed.com/alishan-guide/",
          },
        },
        stay: "阿里山 · 同一旅馆，第2晚",
        pace: "缓冲日",
      },
      {
        id: 6,
        date: "12/20",
        base: "台南",
        name: "下山到台南，只排轻松晚餐",
        route: "早餐退房 → 转运站 → 台铁嘉义 → 台南 → 晚间散步",
        note: "主参考12:40的7322C。到台南办入住后休息；海安／神农街或花园夜市选一处，次日有完整旧城时间。",
        stops: [
          {
            name: "阿里山转运站",
            xy: [120.8037, 23.5101],
            kind: "换乘",
            detail:
              "预留退房、到候车处和验票时间，确认下山目的地是台铁嘉义站。",
            period: "退房后候车",
          },
          {
            name: "台铁嘉义站",
            xy: [120.4412, 23.4791],
            kind: "换乘",
            detail: "下山到的是市区台铁站，按实际到站情况接台南方向列车。",
            period: "山路后留缓冲",
          },
          {
            name: "台铁台南站",
            xy: [120.2129, 22.9971],
            kind: "换乘",
            detail: "去民权路二段97号，拖箱或疲劳时可改搭车。",
            period: "到站后",
          },
          {
            name: "赤崁楼馆（位置示意）",
            xy: [120.2028, 22.9963],
            kind: "住宿",
            detail: "民权路二段97号。先放行李，确认早餐、晚点心和代收箱安排。",
            period: "先休息",
          },
          {
            name: "神农街",
            xy: [120.1965, 22.9977],
            kind: "街区",
            detail: "看街屋和灯笼，留意住宅与营业店面的区别。",
            period: "傍晚／夜间",
          },
          {
            name: "花园夜市（可选）",
            xy: [120.2001, 23.0108],
            kind: "美食",
            detail: "与神农街散步二选一；营业日和天气出发前再确认。",
            period: "替代晚餐",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Alishan+Bus+Station/Chiayi+Station/Tainan+Station/Kindness+Hotel+Tainan+Chihkan+Tower/Shennong+Street/",
        legs: [
          {
            label: "阿里山 → 台铁嘉义站（核对7322C）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%98%BF%E9%87%8C%E5%B1%B1%E8%BD%89%E9%81%8B%E7%AB%99&destination=%E8%87%BA%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&travelmode=transit",
          },
          {
            label: "嘉义 → 台南",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&destination=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&travelmode=transit",
          },
          {
            label: "台南站 → 赤崁楼馆步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=walking",
          },
          {
            label: "酒店 → 神农街步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97&travelmode=walking",
          },
          {
            label: "酒店 → 花园夜市（替代晚餐）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E8%8A%B1%E5%9C%92%E5%A4%9C%E5%B8%82+%E8%87%BA%E5%8D%97&travelmode=transit",
          },
        ],
        culture: {
          title: "先安顿，再看台南的夜晚",
          body: "神农街的街屋、灯笼与小店适合晚间短走。日间市场留给明天，今天在住宿附近吃饭，或只选一个确认营业的夜市。",
          source: {
            title: "Taiwan Obsessed · 台南旧城",
            url: "https://www.taiwanobsessed.com/tainan-taiwan-guide/",
          },
        },
        stay: "台南 · 赤崁楼馆，第1晚",
        pace: "移动日",
      },
      {
        id: 7,
        date: "12/21",
        base: "台南",
        name: "台南，把一天留给旧城",
        route: "国华街／永乐市场早午餐 → 赤崁街区 → 巷弄与咖啡 → 回住宿",
        note: "今天继续住赤崁楼馆。早点吃日间小吃，午后选一小片街区；室内场馆先查周一休馆，不把博物馆设为必去。",
        stops: [
          {
            name: "赤崁楼馆（位置示意）",
            xy: [120.2028, 22.9963],
            kind: "住宿",
            detail: "民权路二段97号。先放行李，确认早餐、晚点心和代收箱安排。",
            period: "先休息",
          },
          {
            name: "国华街／永乐市场",
            xy: [120.1983, 22.9979],
            kind: "美食",
            detail: "早点吃日间小吃，逐家查营业；选两三家即可。",
            period: "早午餐",
          },
          {
            name: "神农街",
            xy: [120.1965, 22.9977],
            kind: "街区",
            detail: "看街屋和灯笼，留意住宅与营业店面的区别。",
            period: "傍晚／夜间",
          },
          {
            name: "赤崁楼馆（回住宿）",
            xy: [120.2028, 22.9963],
            kind: "休息",
            detail: "同一住处再住一晚，下午可以随时回房间休息。",
            period: "弹性",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Kindness+Hotel+Tainan+Chihkan+Tower/Guohua+Street+Section+3+Tainan/Shennong+Street/Kindness+Hotel+Tainan+Chihkan+Tower/",
        legs: [
          {
            label: "酒店 → 国华街早午餐",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4+%E8%87%BA%E5%8D%97&travelmode=walking",
          },
          {
            label: "国华街 → 神农街步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E8%87%BA%E5%8D%97&destination=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97&travelmode=walking",
          },
          {
            label: "旧城 → 赤崁楼馆",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=walking",
          },
        ],
        culture: {
          title: "把小吃放回街区里",
          body: "国华街、永乐市场安排早午餐。接着看旧城巷弄、招牌与店面，午后找地方坐下；如果选择林百货或展馆，先查当天开放。",
          source: {
            title: "Taiwanderers · 台南街区与小吃",
            url: "https://taiwanderers.com/tainan-taiwan-things-to-do/",
          },
        },
        stay: "台南 · 同一旅馆，第2晚",
        pace: "缓冲日",
      },
      {
        id: 8,
        date: "12/22",
        base: "高雄",
        name: "南下高雄，先去旗津",
        route: "台南早餐 → 高雄站前馆寄箱 → 鼓山渡轮 → 旗津 → 驳二可选",
        note: "前一天已经逛过国华街。今天早餐后南下，不等15:00入住，争取15:30前到鼓山候船；时间或天气不合适则删旗津。",
        stops: [
          {
            name: "台铁台南站",
            xy: [120.2129, 22.9971],
            kind: "换乘",
            detail: "去民权路二段97号，拖箱或疲劳时可改搭车。",
            period: "到站后",
          },
          {
            name: "高雄车站／站前馆方向",
            xy: [120.3021, 22.6396],
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
          },
          {
            name: "鼓山渡轮站",
            xy: [120.27, 22.6194],
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
          },
          {
            name: "旗津海岸",
            xy: [120.2682, 22.6079],
            kind: "自然",
            detail: "海岸散步为主，不把冬季日落当成必达打卡。",
            period: "日间优先",
          },
          {
            name: "鼓山渡轮站",
            xy: [120.27, 22.6194],
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
          },
          {
            name: "驳二（可删）",
            xy: [120.2816, 22.62],
            kind: "文化",
            detail: "旧港仓库和公共艺术可单独逛，疲劳或晚到就删。",
            period: "回程可选",
          },
          {
            name: "高雄车站／站前馆方向",
            xy: [120.3021, 22.6396],
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Tainan+Station/Kaohsiung+Station/Kindness+Hotel+Kaohsiung+Main+Station/Gushan+Ferry+Pier/Cijin+Beach/Gushan+Ferry+Pier/Pier-2+Art+Center/",
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
            label: "鼓山 → 旗津（含渡轮）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&destination=%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92&travelmode=transit",
          },
          {
            label: "鼓山 → 驳二（可删）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&destination=%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80&travelmode=walking",
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
        id: 9,
        date: "12/23",
        base: "返港",
        name: "站前馆返程",
        route: "高雄站前馆 → R11高雄车站 → R4高雄国际机场 → 香港",
        note: "参考下午航班；若改早班机，先倒推报到时间，不强求吃07:00开始的酒店早餐。",
        stops: [
          {
            name: "高雄车站／站前馆方向",
            xy: [120.3021, 22.6396],
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
          },
          {
            name: "高雄国际机场",
            xy: [120.35, 22.5771],
            kind: "返程",
            detail: "按实际航班报到要求倒推，行李加购和退改在出票前确认。",
            period: "按航班倒推",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Kindness+Hotel+Kaohsiung+Main+Station/Kaohsiung+International+Airport/",
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
      hotel: 23000,
      food: 6500,
    },
  },
  {
    id: "compact",
    label: "7天紧凑版",
    range: "12/15—12/21 · 示例日期",
    nights: "台北3晚 · 阿里山1晚 · 台南1晚 · 高雄1晚",
    summary: "保留原七天路线，阿里山下山日与台南半日需要主动删减。",
    days: [
      {
        id: 1,
        date: "12/15",
        base: "台北",
        name: "抵达与入住",
        route: "桃园机场 → A1 → 开封街酒店 → 宁夏夜市",
        note: "入住与晚餐为主，夜市只选两三样；图中车站点为区域示意，找出口使用步行导航。",
        stops: [
          {
            name: "桃园国际机场",
            xy: [121.2342, 25.0797],
            kind: "抵达",
            detail: "下午抵达后先处理入境、现金和交通卡，出站时间留出弹性。",
            period: "抵达后",
          },
          {
            name: "台北车站区域",
            xy: [121.517, 25.0478],
            kind: "换乘",
            detail:
              "A1、捷运与高铁出口编号不同；机场捷运到店使用A1的5号出口链接。",
            period: "换乘",
          },
          {
            name: "天云开封分馆（位置示意）",
            xy: [121.5126, 25.0462],
            kind: "住宿",
            detail:
              "开封街一段33号。先放好行李；本点位只示意街区，到店认门牌。",
            period: "先入住",
          },
          {
            name: "宁夏夜市",
            xy: [121.5153, 25.0558],
            kind: "美食",
            detail: "晚餐先选两三样，热门摊位售完时换附近店。",
            period: "晚餐可选",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Taiwan+Taoyuan+International+Airport/Taipei+Main+Station/Tango+Inn+Taipei+Kaifeng/Ningxia+Night+Market/",
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
        pace: "紧凑方案",
      },
      {
        id: 2,
        date: "12/16",
        base: "台北",
        name: "故宫与临江街",
        route: "故宫 → 中山／赤峰街 → 101 → 临江街夜市",
        note: "中山或101登顶可删一项；夜市后搭红线返回台北车站。",
        stops: [
          {
            name: "天云开封分馆（位置示意）",
            xy: [121.5126, 25.0462],
            kind: "住宿",
            detail: "在酒店或附近吃早餐，先去故宫，不额外排热门早餐店。",
            period: "早餐后出门",
          },
          {
            name: "故宫",
            xy: [121.5485, 25.1024],
            kind: "文化",
            detail:
              "选重点展厅，不把所有展馆都塞进一个上午。早餐在酒店周边解决。",
            period: "上午",
          },
          {
            name: "中山／赤峰街",
            xy: [121.5204, 25.0527],
            kind: "街区",
            detail: "午餐、咖啡与小店留作休息段，体力不足时缩短。",
            period: "午后",
          },
          {
            name: "台北101",
            xy: [121.5645, 25.0339],
            kind: "城市",
            detail: "观景台可选；能见度差时只在周边散步。",
            period: "傍晚可选",
          },
          {
            name: "临江街夜市",
            xy: [121.5543, 25.0303],
            kind: "美食",
            detail: "留在信义、大安一侧吃晚饭，再搭红线回台北车站。",
            period: "晚餐",
          },
          {
            name: "天云开封分馆（位置示意）",
            xy: [121.5126, 25.0462],
            kind: "住宿",
            detail: "夜市后搭红线回台北车站，再步行回开封街一段33号。",
            period: "晚间回酒店",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Tango+Inn+Taipei+Kaifeng/National+Palace+Museum/Zhongshan+Station+Taipei/Taipei+101/Linjiang+Street+Night+Market/Tango+Inn+Taipei+Kaifeng/",
        legs: [
          {
            label: "酒店 → 故宫公共交通",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&destination=%E5%9C%8B%E7%AB%8B%E6%95%85%E5%AE%AE%E5%8D%9A%E7%89%A9%E9%99%A2+%E5%8F%B0%E5%8C%97&travelmode=transit",
          },
          {
            label: "101 → 临江街夜市步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97101&destination=%E8%87%A8%E6%B1%9F%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82+%E5%8F%B0%E5%8C%97&travelmode=walking",
          },
          {
            label: "临江街 → 酒店公共交通",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%A8%E6%B1%9F%E8%A1%97%E8%A7%80%E5%85%89%E5%A4%9C%E5%B8%82+%E5%8F%B0%E5%8C%97&destination=%E5%8F%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E6%AD%A3%E5%8D%80%E9%96%8B%E5%B0%81%E8%A1%97%E4%B8%80%E6%AE%B533%E8%99%9F&travelmode=transit",
          },
        ],
        culture: {
          title: "从器物到街区",
          body: "故宫看展之后，给中山的巷子留一点时间；到信义区再看城市尺度的变化。临江街的晚餐与101同在这一侧，少一次跨城折返。",
          source: {
            title: "Taiwanderers · 信义区街区指南",
            url: "https://taiwanderers.com/xinyi-taipei-things-to-do/",
          },
        },
        stay: "台北 · 开封馆，第2晚",
        pace: "紧凑方案",
      },
      {
        id: 3,
        date: "12/17",
        base: "台北",
        name: "北海岸与雨备",
        route: "台北 → 野柳 → 十分 → 九份 → 台北",
        note: "主线为一日团地点顺序。雨天自助先删野柳：瑞芳 → 十分 → 返回瑞芳 → 九份；严重天气改室内。",
        stops: [
          {
            name: "台北车站区域（集合点依订单）",
            xy: [121.517, 25.0478],
            kind: "集合",
            detail:
              "点位只示意台北车站区域；一日团集合位置、时刻以自己的订单为准。",
            period: "早上",
          },
          {
            name: "野柳",
            xy: [121.6899, 25.2061],
            kind: "自然",
            detail: "暴雨、强风时删除，跟团时先确认取消和换日条件。",
            period: "随团时段",
          },
          {
            name: "十分",
            xy: [121.7764, 25.0427],
            kind: "街区",
            detail: "老街和瀑布按交通时间取舍；天灯是自选活动。",
            period: "随团时段",
          },
          {
            name: "九份",
            xy: [121.8452, 25.1099],
            kind: "文化",
            detail: "基山街进、竖崎路看石阶和茶馆，回程记住原集合点。",
            period: "傍晚",
          },
          {
            name: "台北车站区域（返城示意）",
            xy: [121.517, 25.0478],
            kind: "换乘",
            detail: "按一日团实际解散位置回酒店；自助游另查末班铁路与公车。",
            period: "返城后",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Taipei+Main+Station/Yehliu+Geopark/Shifen+Old+Street/Jiufen+Old+Street/Taipei+Main+Station/",
        legs: [
          {
            label: "台北 → 瑞芳（雨备）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E8%BB%8A%E7%AB%99&destination=%E7%91%9E%E8%8A%B3%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "瑞芳 → 十分（原路返回瑞芳再转九份）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%91%9E%E8%8A%B3%E8%BB%8A%E7%AB%99&destination=%E5%8D%81%E5%88%86%E8%BB%8A%E7%AB%99&travelmode=transit",
          },
          {
            label: "瑞芳 → 九份（雨备）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E7%91%9E%E8%8A%B3%E8%BB%8A%E7%AB%99&destination=%E4%B9%9D%E4%BB%BD%E8%80%81%E8%A1%97&travelmode=transit",
          },
        ],
        culture: {
          title: "九份不只是一张灯笼照片",
          body: "基山街找小吃，竖崎路看石阶与老戏院，天气好再选茶馆坐坐。芋圆、草仔粿和茶是沿途选择，不必把每一家名店都排成任务。",
          source: {
            title: "Taiwanderers · 九份茶馆与老街",
            url: "https://taiwanderers.com/jiufen-taiwan-guide/",
          },
        },
        stay: "台北 · 开封馆，第3晚",
        pace: "紧凑方案",
      },
      {
        id: 4,
        date: "12/18",
        base: "阿里山",
        name: "轻装上山",
        route: "台北高铁 → 高铁嘉义站 → 7329 → 阿里山转运站",
        note: "09:30或10:10班次以运营方售票为准；早点到山上，16:00前结束短步道。次日看日出后即下山，体力负担更高。",
        stops: [
          {
            name: "高铁台北站",
            xy: [121.517, 25.0478],
            kind: "换乘",
            detail:
              "从酒店前往高铁站，核对车次月台；按嘉义客运时间倒推高铁抵达时间。",
            period: "早上",
          },
          {
            name: "高铁嘉义站",
            xy: [120.3232, 23.4595],
            kind: "换乘",
            detail: "2号出口查阿里山线候车点，按票券核对月台与班次。",
            period: "预订车次",
          },
          {
            name: "阿里山转运站",
            xy: [120.8037, 23.5101],
            kind: "换乘",
            detail: "这里是客运到达点，与森林铁路车站不同；住宿仍待确认。",
            period: "午后抵达",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Taipei+Main+Station/THSR+Chiayi+Station/Alishan+Bus+Station/",
        legs: [
          {
            label: "台北 → 高铁嘉义站",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E5%8F%B0%E5%8C%97%E9%AB%98%E9%90%B5%E7%AB%99&destination=%E9%AB%98%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&travelmode=transit",
          },
          {
            label: "高铁嘉义站 → 阿里山（核对7329）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%AB%98%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&destination=%E9%98%BF%E9%87%8C%E5%B1%B1%E8%BD%89%E9%81%8B%E7%AB%99&travelmode=transit",
          },
        ],
        culture: {
          title: "先认识森林，再追日出",
          body: "阿里山的车站、步道和林间列车适合分开看。到达日先放包，选短路线；长途上山之后不再安排完整徒步。",
          source: {
            title: "Taiwan Obsessed · 阿里山指南",
            url: "https://www.taiwanobsessed.com/alishan-guide/",
          },
        },
        stay: "阿里山 · 待选旅馆",
        pace: "紧凑方案",
      },
      {
        id: 5,
        date: "12/19",
        base: "台南",
        name: "日出后下山休息",
        route: "祝山 → 返回住宿取包 → 转运站 → 台铁嘉义 → 台南 → 晚间散步",
        note: "主参考12:40的7322C下山；国华街放次日早午餐。海安／神农街与花园夜市二选一，图中花园为可选。",
        stops: [
          {
            name: "祝山观日区",
            xy: [120.8186, 23.5117],
            kind: "自然",
            detail: "发车时间前一天下午公告，网上订票另有中午截止时间。",
            period: "按观日公告",
          },
          {
            name: "阿里山转运站",
            xy: [120.8037, 23.5101],
            kind: "换乘",
            detail: "这里是客运到达点，与森林铁路车站不同；住宿仍待确认。",
            period: "到达后",
          },
          {
            name: "台铁嘉义站",
            xy: [120.4412, 23.4791],
            kind: "换乘",
            detail: "下山到的是市区台铁站，按实际到站情况接台南方向列车。",
            period: "山路后留缓冲",
          },
          {
            name: "台铁台南站",
            xy: [120.2129, 22.9971],
            kind: "换乘",
            detail: "去民权路二段97号，拖箱或疲劳时可改搭车。",
            period: "到站后",
          },
          {
            name: "赤崁楼馆（位置示意）",
            xy: [120.2028, 22.9963],
            kind: "住宿",
            detail: "民权路二段97号。先放行李，确认早餐、晚点心和代收箱安排。",
            period: "先休息",
          },
          {
            name: "神农街",
            xy: [120.1965, 22.9977],
            kind: "街区",
            detail: "看街屋和灯笼，留意住宅与营业店面的区别。",
            period: "傍晚／夜间",
          },
          {
            name: "花园夜市（可选）",
            xy: [120.2001, 23.0108],
            kind: "美食",
            detail: "与神农街散步二选一；营业日和天气出发前再确认。",
            period: "替代晚餐",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Alishan+Forest+Railway+Station/Zhushan+Sunrise+Observation+Deck/Alishan+Forest+Railway+Station/Alishan+Bus+Station/Chiayi+Station/Tainan+Station/Kindness+Hotel+Tainan+Chihkan+Tower/Shennong+Street/",
        legs: [
          {
            label: "祝山列车公告与订票",
            url: "https://afrts.forest.gov.tw/",
          },
          {
            label: "阿里山 → 台铁嘉义站（核对7322C）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%98%BF%E9%87%8C%E5%B1%B1%E8%BD%89%E9%81%8B%E7%AB%99&destination=%E8%87%BA%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&travelmode=transit",
          },
          {
            label: "嘉义 → 台南",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E5%98%89%E7%BE%A9%E7%AB%99&destination=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&travelmode=transit",
          },
          {
            label: "台南站 → 赤崁楼馆步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E9%90%B5%E8%87%BA%E5%8D%97%E7%AB%99&destination=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&travelmode=walking",
          },
          {
            label: "酒店 → 神农街步行",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E7%A5%9E%E8%BE%B2%E8%A1%97+%E8%87%BA%E5%8D%97&travelmode=walking",
          },
          {
            label: "酒店 → 花园夜市（替代晚餐）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E8%8A%B1%E5%9C%92%E5%A4%9C%E5%B8%82+%E8%87%BA%E5%8D%97&travelmode=transit",
          },
        ],
        culture: {
          title: "先安顿，再看台南的夜晚",
          body: "神农街的街屋、灯笼与小店适合晚间短走。日间市场留给明天，今天在住宿附近吃饭，或只选一个确认营业的夜市。",
          source: {
            title: "Taiwan Obsessed · 台南旧城",
            url: "https://www.taiwanobsessed.com/tainan-taiwan-guide/",
          },
        },
        stay: "台南 · 赤崁楼馆",
        pace: "紧凑方案",
      },
      {
        id: 6,
        date: "12/20",
        base: "高雄",
        name: "早午餐与旗津",
        route:
          "国华街早午餐 → 台南站 → 高雄站前馆寄存 → 鼓山 → 旗津 → 驳二可选",
        note: "以12:30前搭车南下、15:30前到鼓山候船为目标；不等酒店入住。晚到删旗津日落，驳二可删。",
        stops: [
          {
            name: "赤崁楼馆（位置示意）",
            xy: [120.2028, 22.9963],
            kind: "住宿",
            detail: "民权路二段97号。先放行李，确认早餐、晚点心和代收箱安排。",
            period: "先休息",
          },
          {
            name: "国华街／永乐市场",
            xy: [120.1983, 22.9979],
            kind: "美食",
            detail: "早点吃日间小吃，逐家查营业；选两三家即可。",
            period: "早午餐",
          },
          {
            name: "台铁台南站",
            xy: [120.2129, 22.9971],
            kind: "换乘",
            detail: "去民权路二段97号，拖箱或疲劳时可改搭车。",
            period: "到站后",
          },
          {
            name: "高雄车站／站前馆方向",
            xy: [120.3021, 22.6396],
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
          },
          {
            name: "鼓山渡轮站",
            xy: [120.27, 22.6194],
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
          },
          {
            name: "旗津海岸",
            xy: [120.2682, 22.6079],
            kind: "自然",
            detail: "海岸散步为主，不把冬季日落当成必达打卡。",
            period: "日间优先",
          },
          {
            name: "鼓山渡轮站",
            xy: [120.27, 22.6194],
            kind: "渡轮",
            detail: "先查天气与轮渡运行，把排队计入港区时间。",
            period: "先查轮渡",
          },
          {
            name: "驳二（可删）",
            xy: [120.2816, 22.62],
            kind: "文化",
            detail: "旧港仓库和公共艺术可单独逛，疲劳或晚到就删。",
            period: "回程可选",
          },
          {
            name: "高雄车站／站前馆方向",
            xy: [120.3021, 22.6396],
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Kindness+Hotel+Tainan+Chihkan+Tower/Guohua+Street+Section+3+Tainan/Tainan+Station/Kaohsiung+Station/Kindness+Hotel+Kaohsiung+Main+Station/Gushan+Ferry+Pier/Cijin+Beach/Gushan+Ferry+Pier/Pier-2+Art+Center/",
        legs: [
          {
            label: "台南酒店 → 国华街早午餐",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E8%87%BA%E5%8D%97%E5%B8%82%E4%B8%AD%E8%A5%BF%E5%8D%80%E6%B0%91%E6%AC%8A%E8%B7%AF%E4%BA%8C%E6%AE%B597%E8%99%9F&destination=%E5%9C%8B%E8%8F%AF%E8%A1%97%E4%B8%89%E6%AE%B5+%E6%B0%B8%E6%A8%82%E5%B8%82%E5%A0%B4+%E8%87%BA%E5%8D%97&travelmode=walking",
          },
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
            label: "鼓山 → 旗津（含渡轮）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&destination=%E6%97%97%E6%B4%A5%E6%B5%B7%E5%B2%B8%E5%85%AC%E5%9C%92&travelmode=transit",
          },
          {
            label: "鼓山 → 驳二（可删）",
            url: "https://www.google.com/maps/dir/?api=1&origin=%E9%BC%93%E5%B1%B1%E8%BC%AA%E6%B8%A1%E7%AB%99&destination=%E9%A7%81%E4%BA%8C%E8%97%9D%E8%A1%93%E7%89%B9%E5%8D%80&travelmode=walking",
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
        stay: "高雄 · 站前馆",
        pace: "紧凑方案",
      },
      {
        id: 7,
        date: "12/21",
        base: "返港",
        name: "站前馆返程",
        route: "高雄站前馆 → R11高雄车站 → R4高雄国际机场 → 香港",
        note: "参考下午航班；若改早班机，先倒推报到时间，不强求吃07:00开始的酒店早餐。",
        stops: [
          {
            name: "高雄车站／站前馆方向",
            xy: [120.3021, 22.6396],
            kind: "换乘",
            detail: "先到建国二路295号寄箱，再去港区，不等正式入住。",
            period: "寄存／返站",
          },
          {
            name: "高雄国际机场",
            xy: [120.35, 22.5771],
            kind: "返程",
            detail: "按实际航班报到要求倒推，行李加购和退改在出票前确认。",
            period: "按航班倒推",
          },
        ],
        previewUrl:
          "https://www.google.com/maps/dir/Kindness+Hotel+Kaohsiung+Main+Station/Kaohsiung+International+Airport/",
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
        pace: "紧凑方案",
      },
    ],
    budget: {
      flight: 1800,
      hotel: 18000,
      food: 5000,
    },
  },
];
export const taiwanDays = taiwanPlans[0].days;
