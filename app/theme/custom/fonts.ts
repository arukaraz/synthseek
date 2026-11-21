import { THEME_FONT_EXTENSIONS, THEME_FONT_NAME_MAX_CHARS, THEME_FONTS_PATH } from "./constants";

function isAlphanumeric(char: string): boolean {
  return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || (char >= "0" && char <= "9");
}

function isFileChar(char: string): boolean {
  return isAlphanumeric(char) || char === "." || char === "_" || char === "-";
}

export function isFontFile(file: string): boolean {
  if (file.length === 0 || file.length > THEME_FONT_NAME_MAX_CHARS || !isAlphanumeric(file[0])) return false;
  for (const char of file) {
    if (!isFileChar(char)) return false;
  }
  const dot = file.lastIndexOf(".");
  return dot > 0 && THEME_FONT_EXTENSIONS.some((extension) => extension === file.slice(dot + 1));
}

export function fontFamilyOf(file: string): string {
  const dot = file.lastIndexOf(".");
  return dot > 0 ? file.slice(0, dot) : file;
}

export function fontFaceBlock(files: readonly string[]): string {
  return files
    .filter(isFontFile)
    .map(
      (file) =>
        `@font-face{font-family:"${fontFamilyOf(file)}";src:url("${THEME_FONTS_PATH}/${file}");font-display:swap}`
    )
    .join("\n");
}
