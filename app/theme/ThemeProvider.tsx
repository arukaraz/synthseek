"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const AVAILABLE_THEMES: string[] = ["light", "dark", "midnight", "ocean"];
export type Theme = "light" | "dark" | "midnight" | "ocean" | "system";

type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
