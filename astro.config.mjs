import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// open markdown links in a new tab
const externalLinks = {
  name: "external-links",
  element: {
    filter: ["a"],
    visit: (node, ctx) => ctx.setProperty(node, "target", "_blank")
  }
};

export default defineConfig({
  outDir: "./out",
  build: { format: "file" },
  redirects: { "/": "/issues" },
  vite: { plugins: [tailwindcss()] },
  markdown: { processor: satteri({ hastPlugins: [externalLinks] }) }
});
