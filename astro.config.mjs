import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://altner.github.io/blog/",
  base: "/blog",
  devToolbar: {
    enabled: false,
  },
  integrations: [sitemap()],
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Lora",
      cssVariable: "--font-lora",
    },
  ],
  trailingSlash: "always",
  vite: {
    ssr: {
      noExternal: ["smartypants"],
    },
  },
});
