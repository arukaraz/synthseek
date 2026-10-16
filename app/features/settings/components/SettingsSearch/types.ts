import type { SettingsSearchResult } from "../../types";

export interface HighlightPart {
  text: string;
  match: boolean;
}

export interface HighlightedTextProps {
  text: string;
  query: string;
}

export interface SettingsSearchBoxProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
}

export interface SettingsSearchResultsProps {
  query: string;
  results: readonly SettingsSearchResult[];
  onPick: (result: SettingsSearchResult) => void;
}

export interface SettingsPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PaletteItem {
  kind: "action" | "setting";
  id: string;
  label: string;
  place: string;
  run: () => void;
}
