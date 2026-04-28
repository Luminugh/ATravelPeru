import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "hybrid",
  adapter: vercel(),
  build: {
    outDir: "docs"
  },
  server: {
    port: 4321,
    host: true
  }
});
