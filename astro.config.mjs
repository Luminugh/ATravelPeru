import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  build: {
    outDir: "docs"
  },
  server: {
    port: 4321,
    host: true
  }
});
