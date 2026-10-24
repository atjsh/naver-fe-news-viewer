import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
  issues: defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/fe-news/issues" })
  })
};
