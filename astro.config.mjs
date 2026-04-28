import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    imagesConfig: {
      sizes: [320, 640, 1280],
      formats: ["image/webp"]
    }
  }),
  output: "static",
  outDir: "./dist",
  server: {
    port: 4321,
    host: true
  }
});
