import type { z } from "zod";

import type { contractTokenSchema, themeContractSchema, themePresetIdSchema } from "./schema";

export type ThemePresetId = z.infer<typeof themePresetIdSchema>;
export type ThemeScheme = "dark" | "light";
export type ThemeContract = z.infer<typeof themeContractSchema>;
export type ContractToken = z.infer<typeof contractTokenSchema>;
export type ContractTokenKind = ContractToken["kind"];
export type ContractPart = ThemeContract["parts"][number];
export type ContractFile = ThemeContract["files"][number];
