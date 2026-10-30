import type { BoardItem, BoardTemplateApplied, BoardTemplatePreview } from "@hooks/api/queries/board/types";

export type ReadableTemplate = Extract<BoardTemplatePreview, { ok: true }>;

export type ReportTone = "info" | "warning" | "danger";

export interface ReportLine {
  key: string;
  text: string;
  tone: ReportTone;
}

export interface BoardSettingsPanelProps {
  items: BoardItem[];
  onApplied: (applied: BoardTemplateApplied) => void;
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
