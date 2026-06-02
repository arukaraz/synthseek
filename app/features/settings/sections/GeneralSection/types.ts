import type { inferRouterOutputs } from "@trpc/server";
import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent } from "react";

import type { AppRouter } from "@api/__generated__/types";
import type { Theme } from "@theme/ThemeProvider";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PreviewTheme = "dark" | "midnight" | "ocean";

export interface ThemeOption {
  value: Theme;
  label: string;
  hint?: string;
  icon: LucideIcon;
  preview: PreviewTheme;
}

export interface ThemeSelectorProps {
  value: Theme | undefined;
  onSelect: (value: Theme) => void;
  ariaLabel: string;
}

export interface ThemeCardOptionProps {
  option: ThemeOption;
  selected: boolean;
  tabbable: boolean;
  onSelect: (value: Theme) => void;
  registerRef: (value: Theme, node: HTMLButtonElement | null) => void;
  onKeyNav: (event: ThemeCardKeyboardEvent, value: Theme) => void;
}

export interface ThemePreviewProps {
  preview: PreviewTheme;
}

export type ThemeCardKeyboardEvent = KeyboardEvent<HTMLButtonElement>;

export type RovingNavKey = "ArrowRight" | "ArrowDown" | "ArrowLeft" | "ArrowUp" | "Home" | "End";

export type ApiKeySummary = RouterOutputs["apiKeys"]["list"][number];
export type CreatedApiKey = RouterOutputs["apiKeys"]["create"];

export interface ApiKeyRowProps {
  apiKey: ApiKeySummary;
}

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
