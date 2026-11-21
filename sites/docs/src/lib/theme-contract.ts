import { z } from "zod";
import contract from "../../../../app/theme/contract/contract.json";
import presets from "../../../../app/theme/contract/presets.generated.json";
import copy from "../../../../app/modules/i18n/messages/en/theme.json";
import editorCopy from "../../../../app/modules/i18n/messages/en/themeEditor.json";

const TokenKindSchema = z.enum(["color", "font", "number", "length"]);
const PartLevelSchema = z.enum(["region", "generic"]);

const ContractSchema = z.object({
  files: z.array(z.object({ id: z.string().min(1), path: z.string().min(1) })).min(1),
  presets: z.array(z.object({ id: z.string().min(1) })).min(1),
  tokens: z.array(z.object({ name: z.string().min(1), file: z.string().min(1), kind: TokenKindSchema })).min(1),
  parts: z.array(z.object({ name: z.string().min(1), level: PartLevelSchema })).min(1),
  attributes: z.array(z.object({ name: z.string().min(1), values: z.array(z.string().min(1)).min(1) })),
});

const PresetValuesSchema = z.record(z.string(), z.record(z.string(), z.string()));

const CopySchema = z.object({
  sections: z.record(z.string(), z.string().min(1)),
  tokens: z.record(z.string(), z.object({ label: z.string().min(1), hint: z.string() })),
  parts: z.record(z.string(), z.string().min(1)),
});

const EditorCopySchema = z.object({ presets: z.record(z.string(), z.string().min(1)) });

export type TokenKind = z.infer<typeof TokenKindSchema>;
export type PartLevel = z.infer<typeof PartLevelSchema>;

export interface TokenRow {
  name: string;
  kind: TokenKind;
  label: string;
  hint: string;
  values: string[];
}

export interface TokenGroup {
  id: string;
  path: string;
  label: string;
  columns: string[];
  rows: TokenRow[];
}

export interface ThemePart {
  name: string;
  level: PartLevel;
  description: string;
}

export interface ThemeAttribute {
  name: string;
  values: string[];
}

const parsed = ContractSchema.parse(contract);
const values = PresetValuesSchema.parse(presets);
const text = CopySchema.parse(copy);
const presetNames = EditorCopySchema.parse(editorCopy).presets;

function found<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`The theme reference has no ${what}`);
  return value;
}

function rowOf(token: z.infer<typeof ContractSchema>["tokens"][number]): TokenRow {
  const words = found(text.tokens[token.name], `text for ${token.name}`);
  return {
    name: token.name,
    kind: token.kind,
    label: words.label,
    hint: words.hint,
    values: parsed.presets.map((preset) =>
      found(found(values[preset.id], `preset ${preset.id}`)[token.name], `${preset.id} value for ${token.name}`),
    ),
  };
}

function groupOf(file: z.infer<typeof ContractSchema>["files"][number]): TokenGroup {
  const rows = parsed.tokens.filter((token) => token.file === file.id).map(rowOf);
  const varies = rows.some((row) => row.values.some((value) => value !== row.values[0]));
  return {
    id: file.id,
    path: file.path,
    label: found(text.sections[file.id], `name for the ${file.id} file`),
    columns: varies
      ? parsed.presets.map((preset) => found(presetNames[preset.id], `name for ${preset.id}`))
      : ["Value"],
    rows: varies ? rows : rows.map((row) => ({ ...row, values: row.values.slice(0, 1) })),
  };
}

export const TOKEN_GROUPS: TokenGroup[] = parsed.files.map(groupOf);

export const THEME_PARTS: ThemePart[] = parsed.parts.map((part) => ({
  name: part.name,
  level: part.level,
  description: found(text.parts[part.name], `text for the ${part.name} part`),
}));

export const THEME_ATTRIBUTES: ThemeAttribute[] = parsed.attributes;
