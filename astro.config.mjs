import shiki from "@shikijs/markdown-it";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import linkAttributes from "markdown-it-link-attributes";

const md = MarkdownIt({ html: true, linkify: true })
  .use(
    await shiki({
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light-dark()"
    })
  )
  .use(linkAttributes, { attrs: { target: "_blank" } })
  .use(anchor);

const tagFilter = (s) =>
  s.replace(
    /<(?=\/?(title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext)\b)/gi,
    "&lt;"
  );

const markdownIt = {
  name: "markdown-it",
  options: {},
  createRenderer: async () => ({
    render: async (content) => {
      const env = {};
      const tokens = md.parse(content, env);
      const headings = tokens.flatMap((t, i) =>
        t.type === "heading_open"
          ? [
              {
                depth: +t.tag[1],
                slug: t.attrGet("id"),
                text: inlineText(tokens[i + 1])
              }
            ]
          : []
      );
      return {
        code: tagFilter(md.renderer.render(tokens, md.options, env)),
        metadata: {
          headings,
          localImagePaths: [],
          remoteImagePaths: [],
          frontmatter: {}
        }
      };
    }
  })
};

const inlineText = (token) =>
  token.children
    .filter((c) => c.type === "text" || c.type === "code_inline")
    .map((c) => c.content)
    .join("");

export default defineConfig({
  outDir: "./out",
  build: { format: "file" },
  redirects: { "/": "/issues" },
  vite: { plugins: [tailwindcss()] },
  markdown: { processor: markdownIt }
});
