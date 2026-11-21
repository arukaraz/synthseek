import type { ReactNode } from "react";

import type { IconButtonProps } from "@components/ui/IconButton";

import type { SharePanelKind } from "../SharePanel";
import type { ThemeEditor } from "../../types";

export interface ThemeEditorCardProps {
  safeEdit: boolean;
}

export interface EditorFrameProps {
  editor: ThemeEditor;
  safeEdit: boolean;
}

export interface EditorMenuProps {
  editor: ThemeEditor;
  panel: SharePanelKind | null;
  onShare: (kind: SharePanelKind) => void;
}

export interface EditorBarProps {
  editor: ThemeEditor;
}

export interface EditorNotesProps {
  editor: ThemeEditor;
  safeEdit: boolean;
}

export interface MenuRowProps {
  label: string;
  tip: string;
  children: ReactNode;
}

export type TipIconButtonProps = Omit<IconButtonProps, "aria-label"> & {
  label: string;
};

export type SchemeMismatch = "lightOverDark" | "darkOverLight";

export type BarStatus =
  | { kind: "broken"; file: string; others: number }
  | { kind: "saving" }
  | { kind: "unsaved" }
  | { kind: "saved" };

export interface UndoKeyEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}
