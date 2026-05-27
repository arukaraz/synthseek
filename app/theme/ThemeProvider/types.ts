import type { ThemeProvider as NextThemesProvider } from "next-themes";

export type Theme = "light" | "dark" | "midnight" | "ocean" | "system";

export type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];
