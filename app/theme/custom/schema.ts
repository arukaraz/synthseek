import { z } from "zod";

import { themePresetIdSchema } from "@theme/contract";

const themeMetaSchema = z.object({
  name: z.string(),
  scheme: z.enum(["dark", "light"]),
  startedFrom: themePresetIdSchema,
  follows: z.array(z.string()),
});

export const themeDraftSchema = z.object({
  meta: themeMetaSchema,
  files: z.record(z.string(), z.string()),
});

export const storedDraftSchema = z.object({
  at: z.number(),
  draft: themeDraftSchema,
  base: z.object({ meta: themeMetaSchema, files: z.record(z.string(), z.string().nullable()) }).optional(),
});
