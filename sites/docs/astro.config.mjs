import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { rehypeCodeChrome } from "./src/lib/rehype-code-chrome.mjs";
import { rehypeTableScroll } from "./src/lib/rehype-table-scroll.mjs";
import { rehypeBaseLinks } from "./src/lib/rehype-base-links.mjs";
import { DOCS_BASES, DOCS_SITE, docsChannelOf } from "./src/lib/channels.mjs";

const base = DOCS_BASES[docsChannelOf(process.env.PUBLIC_DOCS_CHANNEL)];

export default defineConfig({
  site: DOCS_SITE,
  base,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
    },
    rehypePlugins: [rehypeCodeChrome, rehypeTableScroll, rehypeBaseLinks(base)],
  },
});
