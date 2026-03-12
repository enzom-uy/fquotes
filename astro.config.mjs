import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import { SUPPORTED_LOCALES } from "./src/lib/locale-cookie";

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
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
