import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  outDir: "./docs",
  server: {
    port: 4321,
    host: true
  }
});
