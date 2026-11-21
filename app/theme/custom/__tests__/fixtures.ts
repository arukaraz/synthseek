import { THEME_CONTRACT, THEME_PRESETS } from "@theme/contract";
import type { ThemePresetId } from "@theme/contract";

import { tokenPathOf } from "../draft";
import type { ThemeDraft } from "../types";

export function oklch(args: string): string {
  return `oklch(${args})`;
}

export function hex(digits: string): string {
  return `#${digits}`;
}

export function presetFiles(presetId: ThemePresetId): { path: string; text: string }[] {
  const values = THEME_PRESETS[presetId];
  return THEME_CONTRACT.files.map((file) => {
    const lines = THEME_CONTRACT.tokens
      .filter((token) => token.file === file.id)
      .map((token) => `  ${token.name}: ${values[token.name]};`);
    return { path: tokenPathOf(file.id), text: `:root {\n${lines.join("\n")}\n}\n` };
  });
}

export function presetFollows(): string[] {
  return THEME_CONTRACT.tokens.filter((token) => token.follows).map((token) => token.name);
}

export function presetDraft(presetId: ThemePresetId = "dark"): ThemeDraft {
  const files: Record<string, string> = {};
  for (const file of presetFiles(presetId)) files[file.path] = file.text;
  return {
    meta: { name: "Mine", scheme: "dark", startedFrom: presetId, follows: presetFollows() },
    files,
  };
}
