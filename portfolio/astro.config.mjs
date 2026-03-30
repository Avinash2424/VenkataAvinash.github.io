import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://Avinash2424.github.io",
  base: "/VenkataAvinash.github.io",
  integrations: [tailwind()],
  output: "static",
});
