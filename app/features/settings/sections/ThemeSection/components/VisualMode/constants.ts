import { THEME_CONTRACT } from "@theme/contract";
import type { ContractToken } from "@theme/contract";

export const SECTION_TOKENS: ReadonlyMap<string, readonly ContractToken[]> = new Map(
  THEME_CONTRACT.files.map((file) => [file.id, THEME_CONTRACT.tokens.filter((token) => token.file === file.id)])
);

export const FACTORY_PRESET = "dark";
export const TYPOGRAPHY_SECTION = "typography";
export const FONT_SANS = "--font-sans";
export const FONT_MONO = "--font-mono";
export const FONT_ACCEPT = ".woff2,.woff,.ttf,.otf";

export const HUMANIST_STACK = 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", sans-serif';
export const GEOMETRIC_STACK = 'Avenir, Montserrat, Corbel, "URW Gothic", sans-serif';
export const ROUNDED_STACK = 'ui-rounded, Quicksand, Comfortaa, "Arial Rounded MT Bold", Calibri, sans-serif';
export const SERIF_STACK = 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
export const MONOSPACE_STACK = 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace';
export const COURIER_STACK = '"Courier New", Courier, monospace';
