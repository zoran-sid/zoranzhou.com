import type { Locale } from "../i18n/utils";

const entries = [
  {
    name: "smile",
    keywords: "开心 微笑 smile happy",
  },
  {
    name: "laugh",
    keywords: "大笑 笑哭 laugh joy",
  },
  {
    name: "wink",
    keywords: "眨眼 wink",
  },
  {
    name: "love",
    keywords: "喜欢 love",
  },
  {
    name: "thinking",
    keywords: "思考 thinking",
  },
  {
    name: "surprised",
    keywords: "惊讶 surprised",
  },
  {
    name: "sad",
    keywords: "难过 sad",
  },
  {
    name: "cry",
    keywords: "哭泣 cry",
  },
  {
    name: "cool",
    keywords: "酷 cool",
  },
  {
    name: "thumbs-up",
    keywords: "赞 同意 thumbs up",
  },
  {
    name: "clap",
    keywords: "鼓掌 clap",
  },
  {
    name: "thanks",
    keywords: "谢谢 thanks",
  },
  {
    name: "heart",
    keywords: "爱心 heart",
  },
  {
    name: "party",
    keywords: "庆祝 party",
  },
  {
    name: "sparkles",
    keywords: "闪光 sparkles",
  },
  {
    name: "fire",
    keywords: "热烈 fire",
  },
  {
    name: "eyes",
    keywords: "看看 eyes",
  },
  {
    name: "coffee",
    keywords: "咖啡 coffee",
  },
  {
    name: "camera",
    keywords: "摄影 camera",
  },
  {
    name: "books",
    keywords: "读书 books",
  },
  {
    name: "run",
    keywords: "跑步 run",
  },
  {
    name: "mountain",
    keywords: "山 徒步 mountain",
  },
  {
    name: "music",
    keywords: "音乐 music",
  },
  {
    name: "ticket",
    keywords: "票根 ticket",
  },
] as const;
const folder = "https://zoranzhou.com/comment-emojis";
export function commentEmoji(locale: Locale) {
  return [
    {
      name: locale === "zh-CN" ? "日常表情" : "Everyday",
      folder,
      type: "svg",
      icon: "smile",
      items: entries.map((item) => item.name),
    },
  ];
}
export async function searchCommentEmoji(query = "") {
  const term = query.trim().toLocaleLowerCase();
  return entries
    .filter((item) => `${item.name} ${item.keywords}`.includes(term))
    .map((item) => ({
      src: `${folder}/${item.name}.svg`,
      title: item.keywords,
    }));
}
