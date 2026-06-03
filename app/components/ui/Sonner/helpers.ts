import type { SonnerTheme } from "./types";

export function resolveSonnerTheme(theme: string | undefined): SonnerTheme {
  if (theme === "light") return "light";
  if (theme === "system") return "system";
  return "dark";
}
