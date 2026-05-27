import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://altner.github.io/blog/",
  base: "/blog",
  devToolbar: {
    enabled: false,
  },
  integrations: [sitemap()],
  trailingSlash: "always",
  vite: {
    ssr: {
      noExternal: ["smartypants"],
    },
  },
});
