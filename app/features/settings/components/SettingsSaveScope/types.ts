import type { ReactNode } from "react";

export interface SaveEntry {
  label: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveDisabled: boolean;
  save: () => unknown;
  cancel: () => void;
}

export interface SaveRegistry {
  register: (id: string, entry: SaveEntry) => void;
  unregister: (id: string) => void;
  navigate: (href: string) => void;
}

export interface SaveScopeState {
  dirty: SaveEntry[];
  saving: boolean;
  saveDisabled: boolean;
  saveAll: () => Promise<boolean>;
  cancelAll: () => void;
}

export interface SettingsSaveScopeProps {
  children: ReactNode;
}

export interface SaveLabelProviderProps {
  label: string;
  children: ReactNode;
}

export interface LeaveChangesDialogProps {
  open: boolean;
  busy: boolean;
  saveDisabled: boolean;
  onStay: () => void;
  onDiscard: () => void;
  onSave: () => void;
}
