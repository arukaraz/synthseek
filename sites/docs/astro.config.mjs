import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { rehypeCodeChrome } from "./src/lib/rehype-code-chrome.mjs";

export default defineConfig({
  site: "https://docs.synthseek.dev",
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
    },
    rehypePlugins: [rehypeCodeChrome],
  },
});
