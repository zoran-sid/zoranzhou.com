// ── Site Identity (non-translatable) ──
export const SITE = {
  url: "https://zoranzhou.com",
  author: "Zoran Zhou",
  since: 2024,
} as const;

// ── Social ──
export const SOCIAL_LINKS = [
  { name: "github", url: "https://github.com/zoran-sid", label: "GitHub" },
  {
    name: "twitter",
    url: "https://x.com/zhouzoran75607",
    label: "X / Twitter",
  },
  { name: "linkedin", url: "#", label: "LinkedIn" },
  { name: "email", url: "mailto:zoranzhou28@gmail.com", label: "Email" },
  {
    name: "bilibili",
    url: "https://space.bilibili.com/596163308",
    label: "Bilibili",
  },
] as const;

// ── Pagination ──
export const PAGINATION = { pageSize: 10 } as const;

export const COPYRIGHT = {
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
} as const;

// ── Homepage: Timeline ──
export const TIMELINE = [
  {
    year: "2025",
    title: "National Cybersecurity Operations",
    description:
      "Participated in national-level security operations. Earned CISP-PTE certification. Studied abroad for cross-cultural technical exchange.",
  },
  {
    year: "2024",
    title: "Gap Year & Realignment",
    description:
      "Stepped back from a planned graduate program. Rebuilt fundamentals, pursued CCIE Enterprise certification, and launched this blog.",
  },
  {
    year: "2022–2023",
    title: "Enterprise Security Engineering",
    description:
      "Managed cybersecurity operations for large-scale enterprise infrastructure. Focused on threat detection, incident response, and security architecture.",
  },
  {
    year: "2020–2021",
    title: "Network Engineering Foundations",
    description:
      "Built expertise in routing, switching, and network automation. Earned Cisco Enterprise certification. Developed a security-first mindset toward infrastructure.",
  },
] as const;

// ── Homepage: Skills ──
export const SKILLS = [
  {
    category: "Networking",
    items: [
      "Cisco IOS / IOS-XE",
      "BGP / OSPF / MPLS",
      "Network Automation",
      "SD-WAN",
      "Wireshark Analysis",
      "Firewall Policy Design",
    ],
  },
  {
    category: "Security",
    items: [
      "Threat Hunting",
      "Incident Response",
      "Penetration Testing",
      "SIEM / SOAR",
      "Vulnerability Management",
      "Zero Trust Architecture",
    ],
  },
  {
    category: "Systems & Tools",
    items: [
      "Linux Administration",
      "Docker / K8s",
      "Python / Bash",
      "Git / GitHub Actions",
      "Cloudflare Ecosystem",
      "OpenWrt",
    ],
  },
] as const;

// ── Social SVG Icons ──
export const SOCIAL_ICONS: Record<string, string> = {
  github: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
  twitter: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  linkedin: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  email: `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
  bilibili: `<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="13" rx="3"/><path stroke-linecap="round" d="m8 3 2.5 3.5M16 3l-2.5 3.5M8 12v2M16 12v2"/></svg>`,
  rss: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.18 15.64a2.18 2.18 0 010 4.36 2.18 2.18 0 010-4.36M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27z"/></svg>`,
};
