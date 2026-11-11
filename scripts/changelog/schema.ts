import { z } from "zod";

import { WHATS_NEW_MAX_HIGHLIGHTS } from "./constants";

const calloutSchema = z.object({
  level: z.enum(["important", "warning", "note"]),
  body: z.string(),
});

const sectionSchema = z.object({
  heading: z.string().optional(),
  category: z.enum(["feature", "fix", "improvement", "breaking", "chore"]).optional(),
  body: z.string().optional(),
  items: z.array(z.string()).optional(),
});

function isAppRoute(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return false;
  return [...value].every((character) => character.trim() !== "");
}

const highlightSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  link: z
    .string()
    .refine(isAppRoute, {
      message: "A highlight link must be a path inside the app, such as /library",
    })
    .optional(),
});

const versionSchema = z.object({
  version: z.string(),
  date: z.string(),
  type: z.enum(["major", "minor", "patch"]),
  title: z.string(),
  highlights: z.array(highlightSchema).max(WHATS_NEW_MAX_HIGHLIGHTS).optional(),
  callouts: z.array(calloutSchema).optional(),
  sections: z.array(sectionSchema),
  issues: z.array(z.number()).optional(),
});

export const changelogSchema = z.object({
  schemaVersion: z.number(),
  versions: z.array(versionSchema),
});
