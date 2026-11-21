import { z } from "zod";

import { themePresetIdSchema } from "@theme/contract";

export const themeDraftSchema = z.object({
  meta: z.object({
    name: z.string(),
    scheme: z.enum(["dark", "light"]),
    startedFrom: themePresetIdSchema,
    follows: z.array(z.string()),
  }),
  files: z.record(z.string(), z.string()),
});

export const storedDraftSchema = z.object({
  at: z.number(),
  draft: themeDraftSchema,
});
