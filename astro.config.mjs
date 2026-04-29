import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  output: "static",
  server: {
    port: 4321,
    host: true
  }
});
