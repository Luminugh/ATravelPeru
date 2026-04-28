import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/static";

export default defineConfig({
  adapter: vercel(),
  output: "static",
  server: {
    port: 4321,
    host: true
  }
});
