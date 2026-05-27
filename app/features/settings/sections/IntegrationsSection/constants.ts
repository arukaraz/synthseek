import type { Affix } from "./types";

export const AFFIX_OPTIONS: ReadonlyArray<{ value: Affix; label: string }> = [
  { value: "off", label: "Off" },
  { value: "prefix", label: "Prefix" },
  { value: "suffix", label: "Suffix" },
];
