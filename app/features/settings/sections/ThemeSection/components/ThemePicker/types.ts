import type { KeyboardEvent } from "react";

import type { ThemePresetId } from "@theme/contract";
import type { Theme } from "@theme/ThemeProvider";
import type { CssVars } from "@theme/utilities/types";

export interface ThemePreviewPaint {
  theme: Theme;
  base?: ThemePresetId;
  vars?: CssVars;
}

export interface ThemeOption {
  value: Theme;
  label: string;
  paint: ThemePreviewPaint;
}

export interface ThemePickerProps {
  editing: boolean;
}

export interface ThemeSelectorProps {
  value: Theme;
  options: ReadonlyArray<ThemeOption>;
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
  paint: ThemePreviewPaint;
}

export type ThemeCardKeyboardEvent = KeyboardEvent<HTMLButtonElement>;

export type RovingNavKey = "ArrowRight" | "ArrowDown" | "ArrowLeft" | "ArrowUp" | "Home" | "End";
