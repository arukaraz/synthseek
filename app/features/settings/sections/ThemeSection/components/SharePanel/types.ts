import type { ThemeEditor, ThemeImportCheck } from "../../types";

export type SharePanelKind = "export" | "import";

export interface SharePanelProps {
  kind: SharePanelKind;
  editor: ThemeEditor;
  onClose: () => void;
}

export interface ExportPanelProps {
  editor: ThemeEditor;
}

export interface ImportPanelProps {
  editor: ThemeEditor;
  onClose: () => void;
}

export interface ImportVerdictProps {
  result: ThemeImportCheck;
  tokensOnly: boolean;
  onTokensOnlyChange: (next: boolean) => void;
}

export interface CheckedImport {
  text: string;
  result: ThemeImportCheck;
}
