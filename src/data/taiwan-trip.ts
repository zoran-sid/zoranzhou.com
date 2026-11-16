export interface TaiwanStop {
  name: string;
  xy: [number, number];
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
}
// User-supplied planning coordinates, not surveyed entrances or road geometry.
// Taipei Main Station is an area marker; use address-based links to find A1 Exit 5.
// The Kaohsiung station marker serves the hotel area; no hotel-door coordinate is invented.
export const taiwanDays: TaiwanDay[] = [
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
      },
      {
        name: "台北车站区域",
        xy: [121.517, 25.0478],
      },
      {
        name: "天云开封分馆（位置示意）",
        xy: [121.5126, 25.0462],
      },
      {
        name: "宁夏夜市",
        xy: [121.5153, 25.0558],
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
      },
      {
        name: "故宫",
        xy: [121.5485, 25.1024],
      },
      {
        name: "中山／赤峰街",
        xy: [121.5204, 25.0527],
      },
      {
        name: "台北101",
        xy: [121.5645, 25.0339],
      },
      {
        name: "临江街夜市",
        xy: [121.5543, 25.0303],
      },
      {
        name: "天云开封分馆（位置示意）",
        xy: [121.5126, 25.0462],
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
        name: "台北车站区域",
        xy: [121.517, 25.0478],
      },
      {
        name: "野柳",
        xy: [121.6899, 25.2061],
      },
      {
        name: "十分",
        xy: [121.7764, 25.0427],
      },
      {
        name: "九份",
        xy: [121.8452, 25.1099],
      },
      {
        name: "台北车站区域",
        xy: [121.517, 25.0478],
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
  },
  {
    id: 4,
    date: "12/18",
    base: "阿里山",
    name: "轻装上山",
    route: "台北高铁 → 高铁嘉义站 → 7329 → 阿里山转运站",
    note: "以10:10上山为主；13:10末班只作补救，晚到取消长步道。大箱交寄条件先确认。",
    stops: [
      {
        name: "台北车站区域",
        xy: [121.517, 25.0478],
      },
      {
        name: "高铁嘉义站",
        xy: [120.3232, 23.4595],
      },
      {
        name: "阿里山转运站",
        xy: [120.8037, 23.5101],
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
      },
      {
        name: "阿里山转运站",
        xy: [120.8037, 23.5101],
      },
      {
        name: "台铁嘉义站",
        xy: [120.4412, 23.4791],
      },
      {
        name: "台铁台南站",
        xy: [120.2129, 22.9971],
      },
      {
        name: "赤崁楼馆（位置示意）",
        xy: [120.2028, 22.9963],
      },
      {
        name: "神农街",
        xy: [120.1965, 22.9977],
      },
      {
        name: "花园夜市（可选）",
        xy: [120.2001, 23.0108],
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
  },
  {
    id: 6,
    date: "12/20",
    base: "高雄",
    name: "早午餐与旗津",
    route: "国华街早午餐 → 台南站 → 高雄站前馆寄存 → 鼓山 → 旗津 → 驳二可选",
    note: "以12:30前搭车南下、15:30前到鼓山候船为目标；不等酒店入住。晚到删旗津日落，驳二可删。",
    stops: [
      {
        name: "赤崁楼馆（位置示意）",
        xy: [120.2028, 22.9963],
      },
      {
        name: "国华街／永乐市场",
        xy: [120.1983, 22.9979],
      },
      {
        name: "台铁台南站",
        xy: [120.2129, 22.9971],
      },
      {
        name: "高雄车站／站前馆方向",
        xy: [120.3021, 22.6396],
      },
      {
        name: "鼓山渡轮站",
        xy: [120.27, 22.6194],
      },
      {
        name: "旗津海岸",
        xy: [120.2682, 22.6079],
      },
      {
        name: "鼓山渡轮站",
        xy: [120.27, 22.6194],
      },
      {
        name: "驳二（可删）",
        xy: [120.2816, 22.62],
      },
      {
        name: "高雄车站／站前馆方向",
        xy: [120.3021, 22.6396],
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
      },
      {
        name: "高雄国际机场",
        xy: [120.35, 22.5771],
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
  },
];
