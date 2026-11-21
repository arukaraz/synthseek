import type { ReactNode } from "react";

import type { ThemePresetId, ThemeScheme } from "@theme/contract";

export type Theme = ThemePresetId | "custom";

export interface ThemeBoot {
  theme: Theme;
  base: ThemePresetId;
  scheme: ThemeScheme;
  fingerprint: string | null;
}

export interface CustomThemeSummary {
  name: string;
  scheme: ThemeScheme;
  startedFrom: ThemePresetId;
  follows: string[];
  fingerprint: string;
  folder: string;
}

export interface ThemeDraftPaint {
  css: string;
  base: ThemePresetId;
  scheme: ThemeScheme;
  unsaved: boolean;
}

export interface ThemeContextValue {
  theme: Theme;
  scheme: ThemeScheme;
  custom: CustomThemeSummary | null;
  isReady: boolean;
  isSelecting: boolean;
  select: (theme: Theme) => void;
  draft: ThemeDraftPaint | null;
  applyDraft: (draft: ThemeDraftPaint | null) => void;
  previewing: boolean;
  startPreview: () => void;
  stopPreview: () => void;
}

export interface ThemeProviderProps {
  boot: ThemeBoot;
  children: ReactNode;
}
