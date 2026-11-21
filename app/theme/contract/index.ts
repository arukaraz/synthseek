import contractSource from "./contract.json";
import presetsSource from "./presets.generated.json";
import { themeContractSchema, themePresetsSchema } from "./schema";

export const THEME_CONTRACT = themeContractSchema.parse(contractSource);
export const THEME_PRESETS = themePresetsSchema.parse(presetsSource);
export const THEME_PRESET_IDS = THEME_CONTRACT.presets.map((preset) => preset.id);
export const CONTRACT_TOKENS = new Map(THEME_CONTRACT.tokens.map((token) => [token.name, token]));

export { themePresetIdSchema } from "./schema";
export type {
  ContractFile,
  ContractPart,
  ContractToken,
  ContractTokenKind,
  ThemeContract,
  ThemePresetId,
  ThemeScheme,
} from "./types";
