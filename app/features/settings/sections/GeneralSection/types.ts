import type { inferRouterOutputs } from "@trpc/server";
import type { TFunction } from "i18next";
import type { LucideIcon } from "lucide-react";
import type { KeyboardEvent } from "react";

import type { AppRouter } from "@api/__generated__/types";
import type { Locale } from "@locale/config";
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
  featured: boolean;
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

export interface CredentialSummary {
  id: string;
  name: string;
  created_at: Date;
  last_used_at: Date | null;
}

export type RevokeLabelKey = "api.row.revokeLabel" | "subsonic.row.revokeLabel";

export interface CredentialColumnsArgs<TCredential extends CredentialSummary> {
  t: TFunction<"settings">;
  revoking: boolean;
  onRevoke: (credential: TCredential) => void;
  revokeLabelKey: RevokeLabelKey;
  appOf?: (credential: TCredential) => string | null;
}

export interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type SubsonicCredentialSummary = RouterOutputs["subsonic"]["listCredentials"][number];
export type CreatedSubsonicCredential = RouterOutputs["subsonic"]["createCredential"];

export interface CreateSubsonicCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ConnectionValueFieldProps {
  label: string;
  value: string;
  helper?: string;
  copyAriaLabel: string;
  copiedMessage: string;
  copyFailedMessage: string;
}

export interface LanguageSelectorProps {
  value: Locale;
  onSelect: (locale: Locale) => void;
  ariaLabel: string;
}
