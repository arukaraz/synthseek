import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { rehypeCodeChrome } from "./src/lib/rehype-code-chrome.mjs";
import { rehypeTableScroll } from "./src/lib/rehype-table-scroll.mjs";
import { DOCS_ORIGINS, docsChannelOf } from "./src/lib/channels.mjs";

export default defineConfig({
  site: DOCS_ORIGINS[docsChannelOf(process.env.PUBLIC_DOCS_CHANNEL)],
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
    },
    rehypePlugins: [rehypeCodeChrome, rehypeTableScroll],
  },
});
