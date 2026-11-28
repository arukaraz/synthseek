import type { ContractToken } from "@theme/contract";

import type { ThemeFontList } from "../../types";

export type ColorToken = Extract<ContractToken, { kind: "color" }>;
export type FontToken = Extract<ContractToken, { kind: "font" }>;
export type RangeToken = Extract<ContractToken, { kind: "number" | "length" }>;

export type FontLabelKey =
  | "system"
  | "humanist"
  | "geometric"
  | "rounded"
  | "serif"
  | "monospace"
  | "systemMono"
  | "courier"
  | "sameAsInterface";

export interface FontPreset {
  key: FontLabelKey;
  stack: string;
}

export interface FontChoice {
  value: string;
  label: string;
}

export interface TokenCopy {
  label: string;
  hint: string;
}

export type UnsavedKind = "own" | "derived";

export interface UnreadablePair {
  text: string;
  ratio: number;
}

export interface SectionEntry {
  id: string;
  label: string;
  dirty: boolean;
}

export interface RowBaseProps {
  label: string;
  hint: string;
  value: string;
  changed: boolean;
  unsaved: boolean;
  presetName: string;
  baseLabel: string | null;
  onWrite: (name: string, value: string) => void;
  onReset: (name: string) => void;
}

export interface ColorRowProps extends RowBaseProps {
  token: ColorToken;
  other: string | null;
  warning: string | null;
  following: boolean;
  onEditInCss: (fileId: string) => void;
}

export interface FontRowProps extends RowBaseProps {
  token: FontToken;
  families: readonly string[];
}

export interface RangeRowProps extends RowBaseProps {
  token: RangeToken;
  onEditInCss: (fileId: string) => void;
}

export interface TokenRowProps extends RowBaseProps {
  token: ContractToken;
  other: string | null;
  warning: string | null;
  following: boolean;
  families: readonly string[];
  onEditInCss: (fileId: string) => void;
}

export interface ResetDotProps {
  token: ContractToken;
  label: string;
  baseLabel: string | null;
  presetName: string;
  changed: boolean;
  unsaved: boolean;
  onReset: (name: string) => void;
}

export interface SectionNavProps {
  sections: readonly SectionEntry[];
  current: string;
  onSelect: (id: string) => void;
}

export interface ControlsHeaderProps {
  query: string;
  onQuery: (query: string) => void;
  showToggle: boolean;
  showAll: boolean;
  total: number;
  hiddenChange: boolean;
  onToggle: () => void;
}

export interface FontUploadProps {
  fonts: ThemeFontList | undefined;
}

export interface FontListProps {
  fonts: ThemeFontList | undefined;
  onUse: (file: string) => void;
}
