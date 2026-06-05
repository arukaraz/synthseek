import { z } from "zod";

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

const versionSchema = z.object({
  version: z.string(),
  date: z.string(),
  type: z.enum(["major", "minor", "patch"]),
  title: z.string(),
  callouts: z.array(calloutSchema).optional(),
  sections: z.array(sectionSchema).optional(),
  issues: z.array(z.number()).optional(),
});

export const changelogSchema = z.object({
  schemaVersion: z.number(),
  versions: z.array(versionSchema),
});
