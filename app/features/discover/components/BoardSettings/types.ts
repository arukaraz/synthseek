import type { BoardItem, BoardTemplateApplied, BoardTemplatePreview } from "@hooks/api/queries/board/types";

import type { BoardBackground } from "../ExploreBoard/types";

export type ReadableTemplate = Extract<BoardTemplatePreview, { ok: true }>;

export interface AppearanceTrayProps {
  background: BoardBackground;
  onBackground: (shown: boolean) => void;
}

export type ReportTone = "info" | "warning" | "danger";

export interface ReportLine {
  key: string;
  text: string;
  tone: ReportTone;
}

export interface BoardTemplatesDialogProps {
  items: BoardItem[];
  onApplied: (applied: BoardTemplateApplied) => void;
  onClose: () => void;
}

export interface TemplateExportProps {
  items: BoardItem[];
}

export interface TemplateImportProps {
  onApplied: (applied: BoardTemplateApplied) => void;
}

export interface TemplateReportProps {
  report: BoardTemplatePreview;
}
