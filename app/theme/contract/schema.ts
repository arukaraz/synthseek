import { z } from "zod";

const tokenName = z.string().startsWith("--");

const tokenBase = {
  name: tokenName,
  file: z.string(),
  essential: z.boolean().optional(),
  follows: tokenName.optional(),
  on: tokenName.optional(),
};

const range = { min: z.number(), max: z.number(), step: z.number().positive() };

export const themePresetIdSchema = z.enum(["dark", "midnight", "ocean"]);

export const contractTokenSchema = z.discriminatedUnion("kind", [
  z.object({ ...tokenBase, kind: z.literal("color") }),
  z.object({ ...tokenBase, kind: z.literal("font") }),
  z.object({ ...tokenBase, kind: z.literal("number"), ...range }),
  z.object({ ...tokenBase, kind: z.literal("length"), unit: z.enum(["rem", "em", "px"]), ...range }),
]);

export const themeContractSchema = z.object({
  version: z.number().int().positive(),
  files: z.array(z.object({ id: z.string(), path: z.string() })),
  presets: z.array(z.object({ id: themePresetIdSchema, path: z.string().optional() })),
  tokens: z.array(contractTokenSchema),
  parts: z.array(z.object({ name: z.string(), level: z.enum(["region", "generic"]) })),
  attributes: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
});

export const themePresetsSchema = z.record(themePresetIdSchema, z.record(tokenName, z.string()));
