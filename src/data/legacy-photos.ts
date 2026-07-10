/**
 * Legacy photos that use remote URLs.
 * These cannot be auto-discovered by import.meta.glob.
 * When these images become available locally, move them to
 * src/assets/photos/<album>/ and remove the entry from this file.
 */

export interface LegacyPhoto {
  src: string;
  alt: string;
}

export interface LegacyAlbum {
  slug: string;
  title: { "zh-CN": string; en: string };
  description?: { "zh-CN": string; en: string };
  date: string;
  location?: string;
  camera?: string;
  photos: LegacyPhoto[];
}

export const legacyAlbums: LegacyAlbum[] = [
  {
    slug: "minya-konka",
    title: { "zh-CN": "贡嘎雪山", en: "Minya Konka" },
    description: { "zh-CN": "蜀山之王。", en: "The King of Sichuan Mountains." },
    date: "2025-09-02",
    location: "四川",
    camera: "Sony A7C2 F2.8 35MM",
    photos: [{ src: "https://e5d9f02.webp.fi/_20260702223108_5_35.jpg", alt: "雪山探索" }],
  },
  {
    slug: "puppy",
    title: { "zh-CN": "小狗", en: "Puppy" },
    description: { "zh-CN": "三亚的咖啡时光。", en: "Coffee in SanYa." },
    date: "2025-11-02",
    location: "三亚",
    camera: "A7C2 F2.8 35mm",
    photos: [{ src: "https://e5d9f02.webp.fi/20260703001232_6_35.jpg", alt: "Puppy" }],
  },
  {
    slug: "photo-1",
    title: { "zh-CN": "照片 1", en: "Photo 1" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703001241_8_35.jpg", alt: "Photo 1" }],
  },
  {
    slug: "photo-2",
    title: { "zh-CN": "照片 2", en: "Photo 2" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703001238_7_35.jpg", alt: "Photo 2" }],
  },
  {
    slug: "photo-3",
    title: { "zh-CN": "照片 3", en: "Photo 3" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703002248_20_35.jpg", alt: "Photo 3" }],
  },
  {
    slug: "photo-4",
    title: { "zh-CN": "照片 4", en: "Photo 4" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703002129_19_35.jpg", alt: "Photo 4" }],
  },
  {
    slug: "photo-5",
    title: { "zh-CN": "照片 5", en: "Photo 5" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703001907_18_35.jpg", alt: "Photo 5" }],
  },
  {
    slug: "photo-6",
    title: { "zh-CN": "照片 6", en: "Photo 6" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703001904_17_35.jpg", alt: "Photo 6" }],
  },
  {
    slug: "photo-7",
    title: { "zh-CN": "照片 7", en: "Photo 7" },
    date: "2026-07-03",
    photos: [{ src: "https://e5d9f02.webp.fi/%E5%9B%BE%E7%89%87_20260703001900_15_35.jpg", alt: "Photo 7" }],
  },
];
