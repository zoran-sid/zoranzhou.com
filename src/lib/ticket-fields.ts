import type { Locale } from "../i18n/utils";
import type { TicketType } from "./ticket-model";

const labels = {
  cinema: ["影院", "Cinema"],
  startTime: ["开始", "Starts"],
  endTime: ["结束", "Ends"],
  auditorium: ["影厅", "Screen"],
  seat: ["座位", "Seat"],
  collectionCode: ["取票码", "Collection code"],
  performance: ["演出", "Performance"],
  artist: ["表演者", "Artist"],
  venue: ["场地", "Venue"],
  section: ["区域", "Section"],
  admission: ["入场方式", "Admission"],
  time: ["时间", "Time"],
  verificationCode: ["验证码", "Verification code"],
  ticketNumber: ["票号", "Ticket number"],
  teams: ["对阵", "Teams"],
  fromStation: ["出发站", "From"],
  toStation: ["到达站", "To"],
  departure: ["出发", "Departure"],
  arrival: ["到达", "Arrival"],
  carriage: ["车厢", "Carriage"],
  ticketGate: ["检票口", "Gate"],
  class: ["席别", "Class"],
  receiptNumber: ["票据编号", "Receipt number"],
  from: ["出发地", "From"],
  fromIata: ["出发机场", "From airport"],
  to: ["目的地", "To"],
  toIata: ["到达机场", "To airport"],
  boardingGate: ["登机口", "Gate"],
  terminal: ["航站楼", "Terminal"],
  boardingGroup: ["登机组", "Group"],
  branch: ["分店／地址", "Branch / address"],
  items: ["消费明细", "Items"],
  total: ["实付", "Total paid"],
  table: ["桌号", "Table"],
  guests: ["人数", "Guests"],
  taxId: ["税号", "Tax ID"],
  invoiceCode: ["发票代码", "Invoice code"],
  invoiceNumber: ["发票号码", "Invoice number"],
  buyer: ["购买方", "Buyer"],
  item: ["项目", "Item"],
  transport: ["交通／行程", "Itinerary"],
} as const;
type FieldKey = keyof typeof labels;
const performance: FieldKey[] = [
  "performance",
  "artist",
  "venue",
  "startTime",
  "endTime",
  "section",
  "seat",
];
export const ticketFieldOrder: Record<TicketType, readonly FieldKey[]> = {
  movie: [
    "cinema",
    "startTime",
    "endTime",
    "auditorium",
    "seat",
    "collectionCode",
  ],
  performance,
  concert: performance,
  theatre: performance,
  comedy: performance,
  exhibition: [
    "venue",
    "admission",
    "time",
    "endTime",
    "verificationCode",
    "ticketNumber",
  ],
  sport: ["teams", "venue", "startTime", "section", "seat"],
  train: [
    "departure",
    "arrival",
    "carriage",
    "seat",
    "ticketGate",
    "class",
    "receiptNumber",
  ],
  flight: [
    "departure",
    "arrival",
    "seat",
    "boardingGate",
    "terminal",
    "boardingGroup",
  ],
  receipt: ["branch", "time", "items", "total", "receiptNumber"],
  dining: [
    "branch",
    "time",
    "table",
    "guests",
    "items",
    "total",
    "receiptNumber",
  ],
  invoice: ["buyer", "item", "taxId", "invoiceCode", "invoiceNumber"],
  travel: ["departure", "transport"],
  other: ["venue", "time"],
};

export function ticketValue(
  details: Record<string, unknown> | undefined,
  key: string,
): string {
  const value = details?.[key];
  return typeof value === "string"
    ? value.trim()
    : typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : "";
}

export function ticketFields(
  type: TicketType,
  details: Record<string, unknown> | undefined,
  locale: Locale,
  compact = false,
) {
  const fields = ticketFieldOrder[type].flatMap((key) => {
    const value = ticketValue(details, key);
    return value
      ? [{ key, label: labels[key][locale === "zh-CN" ? 0 : 1], value }]
      : [];
  });
  return compact ? fields.slice(0, 4) : fields;
}

export function ticketJourney(
  type: TicketType,
  details: Record<string, unknown> | undefined,
) {
  if (!["train", "flight", "travel"].includes(type)) return undefined;
  const from = ticketValue(details, type === "train" ? "fromStation" : "from");
  const to = ticketValue(details, type === "train" ? "toStation" : "to");
  const fromCode = type === "flight" ? ticketValue(details, "fromIata") : "";
  const toCode = type === "flight" ? ticketValue(details, "toIata") : "";
  return from || to || fromCode || toCode
    ? { from, to, fromCode, toCode }
    : undefined;
}
