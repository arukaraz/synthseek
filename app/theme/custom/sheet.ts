import type { CssVars } from "@theme/utilities/types";

import { THEME_SCOPE_SELECTOR, TOKENS_DIRECTORY } from "./constants";
import { scanDeclarations } from "./declarations";
import type { ThemeFileText, TokenName } from "./types";

const FORBIDDEN_FRAGMENTS = ["url(", "image-set(", "image(", "cross-fade(", "src(", "\\", "@", "<", ";", "{", "}"];

function isNameChar(char: string): boolean {
  return (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    (char >= "0" && char <= "9") ||
    char === "_" ||
    char === "-"
  );
}

function isSafeName(name: string): name is TokenName {
  if (!name.startsWith("--") || name.length === 2) return false;
  for (const char of name) {
    if (!isNameChar(char)) return false;
  }
  return true;
}

export function isInertValue(value: string): boolean {
  const lowered = value.toLowerCase();
  return !FORBIDDEN_FRAGMENTS.some((fragment) => lowered.includes(fragment));
}

function safeTokens(files: readonly ThemeFileText[]): [TokenName, string][] {
  const tokens: [TokenName, string][] = [];
  for (const file of files) {
    if (!file.path.startsWith(TOKENS_DIRECTORY)) continue;
    for (const declaration of scanDeclarations(file.text)) {
      if (isSafeName(declaration.name) && isInertValue(declaration.value)) {
        tokens.push([declaration.name, declaration.value]);
      }
    }
  }
  return tokens;
}

export function tokenBlock(files: readonly ThemeFileText[]): string {
  const parts = safeTokens(files).map(([name, value]) => `${name}:${value}`);
  return parts.length === 0 ? "" : `${THEME_SCOPE_SELECTOR}{${parts.join(";")}}`;
}

export function tokenVars(files: readonly ThemeFileText[]): CssVars {
  const vars: CssVars = {};
  for (const [name, value] of safeTokens(files)) vars[name] = value;
  return vars;
}
