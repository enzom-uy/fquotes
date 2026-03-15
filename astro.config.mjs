import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import { SUPPORTED_LOCALES } from "./src/lib/locale-cookie";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://quotekeeper.netlify.app",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !page.includes("/settings") && !page.includes("/quotes"),
    }),
  ],

  output: "server",
  adapter: netlify(),
  i18n: {
    locales: SUPPORTED_LOCALES,
    defaultLocale: "en",
    routing: "manual",
    fallback: {
      es: "en",
      pt: "en",
    },
  },
});

