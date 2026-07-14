// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";

// https://astro.build/config
export default defineConfig({
  site: "https://zoranzhou.com",

  integrations: [
    mdx({
      syntaxHighlight: false,
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            properties: {
              className: ["anchor-link"],
              ariaHidden: true,
              tabIndex: -1,
            },
            content: {
              type: "text",
              value: "#",
            },
          },
        ],
        [
          rehypePrettyCode,
          {
            theme: {
              light: "github-light",
              dark: "github-dark",
            },
            keepBackground: false,
            onVisitLine(node) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node) {
              node.properties.className.push("highlighted");
            },
          },
        ],
      ],
    }),
    sitemap({
      filter: (page) =>
        !page.includes("/404") &&
        !page.endsWith("/404/") &&
        // Exclude root redirect page
        page !== "https://zoranzhou.com/",
      serialize(item) {
        const path = item.url.replace(/^https:\/\/zoranzhou\.com/, "") || "/";
        let priority = 0.7;
        let changefreq = "weekly";

        // Homepage: highest priority
        if (path.match(/^\/(zh-CN|en)\/?$/)) {
          priority = 1.0;
          changefreq = "daily";
        }
        // Web3 Lab landing pages
        else if (path.match(/^\/(zh-CN|en)\/lab\/?$/)) {
          priority = 0.9;
          changefreq = "weekly";
        }
        // Web3 Lab build, security, learning, architecture, and note records
        else if (path.match(/^\/(zh-CN|en)\/lab\/.+/)) {
          priority = 0.65;
          changefreq = "monthly";
        }
        // Blog/research/essays listing pages
        else if (path.match(/^\/(zh-CN|en)\/(blog|essays|research)\/?$/)) {
          priority = 0.8;
          changefreq = "daily";
        }
        // Individual articles
        else if (
          path.match(/^\/(zh-CN|en)\/(blog|essays|research|projects)\/.+/)
        ) {
          priority = 0.6;
          changefreq = "monthly";
        }
        // Tags and projects listing
        else if (path.match(/^\/(zh-CN|en)\/(tags|projects)\/?$/)) {
          priority = 0.5;
          changefreq = "weekly";
        }
        // Tag pages
        else if (path.match(/^\/(zh-CN|en)\/tags\/.+/)) {
          priority = 0.4;
          changefreq = "weekly";
        }

        return {
          url: item.url,
          lastmod: item.lastmod ?? new Date(),
          changefreq,
          priority,
        };
      },
      i18n: {
        defaultLocale: "zh-CN",
        locales: {
          "zh-CN": "zh-Hans",
          en: "en",
        },
      },
    }),
  ],

  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN", "en"],
    routing: {
      redirectToDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    syntaxHighlight: false,
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },

  image: {
    domains: ["e5d9f02.webp.fi"],
  },

  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: false,
  },

  output: "static",

  server: {
    port: 4321,
  },
});
