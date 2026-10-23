import { defineConfig } from "astro/config";
export default defineConfig({
  site: "https://discomedia.co",
  output: "static",
  trailingSlash: "always",
  devToolbar: { enabled: false },
});
