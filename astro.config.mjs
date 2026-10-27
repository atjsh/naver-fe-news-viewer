import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import shiki from "@shikijs/markdown-it";
import { minify } from "html-minifier-terser";
import { defineConfig } from "astro/config";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import linkAttributes from "markdown-it-link-attributes";

const md = MarkdownIt({ html: true, linkify: true })
  .use(
    await shiki({
      themes: { l: "github-light", d: "github-dark" },
      defaultColor: false,
      cssVariablePrefix: "--",
      tabindex: false,
      transformers: [
        {
          pre(n) {
            n.properties.class = "shiki";
          },
          code(n) {
            delete n.properties.class;
            // drop the per-line <span> wrappers; lines are already separated by "\n" text nodes
            n.children = n.children.flatMap((c) => (c.type === "element" ? c.children : [c]));
          }
        }
      ]
    })
  )
  .use(linkAttributes, {
    matcher: (href) => !href.startsWith("#"),
    attrs: { target: "_blank" }
  })
  .use(anchor, {
    // short deterministic URL-safe ids instead of percent-encoded Korean slugs
    slugify: (s) => createHash("sha1").update(s.trim()).digest("base64url").slice(0, 6),
    tabIndex: false,
    permalink: anchor.permalink.linkInsideHeader({ symbol: "#", space: " " })
  });

// Keep wide tables scrollable without changing their native table layout.
md.renderer.rules.table_open = (tokens, idx, options, _env, self) =>
  '<div class="table-scroll" role="region" aria-label="표" tabindex="0">\n' +
  self.renderToken(tokens, idx, options);
md.renderer.rules.table_close = (tokens, idx, options, _env, self) =>
  self.renderToken(tokens, idx, options) + "</div>\n";

const tagFilter = (s) =>
  s.replace(
    /<(?=\/?(title|textarea|style|xmp|iframe|noembed|noframes|script|plaintext)\b)/gi,
    "&lt;"
  );

const hoistShikiColors = (html) => {
  const classes = new Map();
  const code = html.replace(/( class="shiki")? style="(--l:[^"]*)"/g, (_, shiki, style) => {
    if (!classes.has(style)) classes.set(style, `s${classes.size}`);
    const cls = classes.get(style);
    return shiki ? ` class="shiki ${cls}"` : ` class="${cls}"`;
  });
  const css = [...classes].map(([style, cls]) => `.${cls}{${style}}`).join("");
  return { code, css };
};

const markdownIt = {
  name: "markdown-it",
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
      const html = tagFilter(md.renderer.render(tokens, md.options, env)).replace(
        /<img\s/g,
        '<img loading="lazy" decoding="async" referrerpolicy="no-referrer" '
      );
      const { code, css } = hoistShikiColors(html);
      return {
        code,
        metadata: {
          headings,
          localImagePaths: [],
          remoteImagePaths: [],
          frontmatter: { shikiCss: css }
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

const minifyHtml = {
  name: "minify-html",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      let before = 0;
      let after = 0;
      for (const rel of await readdir(root, { recursive: true })) {
        if (!rel.endsWith(".html")) continue;
        const file = join(root, rel);
        const html = await readFile(file, "utf8");
        const min = await minify(html, {
          collapseWhitespace: true,
          removeComments: true,
          removeAttributeQuotes: true,
          removeOptionalTags: true,
          useShortDoctype: true,
          decodeEntities: true,
          sortAttributes: true,
          sortClassName: true,
          minifyCSS: true,
          minifyJS: true
        });
        before += Buffer.byteLength(html);
        after += Buffer.byteLength(min);
        await writeFile(file, min);
      }
      logger.info(`${before} → ${after} bytes (-${(((before - after) / before) * 100).toFixed(1)}%)`);
    }
  }
};

export default defineConfig({
  integrations: [minifyHtml],
  site: "https://fe-news.atj.sh",
  outDir: "./out",
  // Keep the small shared stylesheet cacheable instead of repeating it per page.
  build: { format: "file", inlineStylesheets: "never" },
  redirects: { "/issues": "/" },
  markdown: { processor: markdownIt }
});
