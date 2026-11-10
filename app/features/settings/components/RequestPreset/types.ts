import type { RequestPreset, RequestSelection } from "@features/search/components/ConfigRequestModal/types";

export type PresetChoice = "follow" | "custom";

export interface RequestPresetDraft {
  choice: PresetChoice;
  selection: RequestSelection;
}

export interface RequestPresetEditorProps {
  value: RequestPresetDraft;
  onChange: (next: RequestPresetDraft) => void;
  followLabel: string;
  customLabel: string;
  followSummary: string;
}

export interface RequestPresetCardProps {
  title: string;
  description: string;
  anchor: string;
  own: RequestPreset | null;
  seed: RequestPreset;
  followLabel: string;
  customLabel: string;
  followSummary: string;
  onSave: (preset: RequestPreset | null) => Promise<unknown>;
}
