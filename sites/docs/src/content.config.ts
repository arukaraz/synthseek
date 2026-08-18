import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const GROUPS = ["Start here", "Core concepts", "Setup & admin", "Reference"] as const;

const docs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string().min(1),
    blurb: z.string().min(1),
    group: z.enum(GROUPS),
    order: z.number().int().positive(),
  }),
});

export const collections = { docs };
export { GROUPS };
