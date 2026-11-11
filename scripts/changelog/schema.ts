import { z } from "zod";

import { BARE_VERSION_MESSAGE, IMAGE_FILE_MESSAGE, VIDEO_FILE_MESSAGE, WHATS_NEW_MAX_HIGHLIGHTS } from "./constants";
import { isImageFile, isVideoFile } from "./media";
import { isBareVersion } from "./version";

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

const mediaSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("image"),
    file: z.string().refine(isImageFile, { message: IMAGE_FILE_MESSAGE }),
    alt: z.string().min(1),
  }),
  z.object({
    type: z.literal("video"),
    file: z.string().refine(isVideoFile, { message: VIDEO_FILE_MESSAGE }),
    alt: z.string().min(1),
    poster: z.string().refine(isImageFile, { message: IMAGE_FILE_MESSAGE }).optional(),
  }),
]);

const highlightSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  link: z
    .string()
    .refine(isAppRoute, {
      message: "A highlight link must be a path inside the app, such as /library",
    })
    .optional(),
  media: mediaSchema.optional(),
});

const versionSchema = z.object({
  version: z.string().refine(isBareVersion, { message: BARE_VERSION_MESSAGE }),
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

export type ParsedChangelog = z.infer<typeof changelogSchema>;
