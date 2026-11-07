import type { BoardAppearance, BoardLists, BoardTemplatePreview } from "@hooks/api/queries/board/types";

import type { SettingsLinkNoteProps } from "../CustomWidget/types";
import type { BoardBackground } from "../ExploreBoard/types";
import type { BOARD_SETTINGS_TABS } from "./constants";

export type ReadableTemplate = Extract<BoardTemplatePreview, { ok: true }>;

export interface AppearancePanelProps {
  appearance?: BoardAppearance;
  onAppearance: (appearance: BoardAppearance) => void;
  background: BoardBackground;
  onBackground: (shown: boolean) => void;
}

export type BoardSettingsTab = (typeof BOARD_SETTINGS_TABS)[number];

export interface StagedTemplate {
  json: string;
  template: ReadableTemplate;
}

export type StageTemplate = (json: string, template: ReadableTemplate) => void;

export type ReportTone = "info" | "warning" | "danger";

export interface ReportLine {
  key: string;
  text: string | SettingsLinkNoteProps;
  tone: ReportTone;
}

export interface TemplatesPanelProps extends TemplateImportProps {
  lists: BoardLists;
}

export type BoardSettingsDiscard = { kind: "close" } | { kind: "template"; stage: () => void };

export interface TemplateExportProps {
  lists: BoardLists;
}

export interface TemplateImportProps {
  staged: boolean;
  onStage: StageTemplate;
  onUnstage: () => void;
}

export interface TemplateReportProps {
  report: BoardTemplatePreview;
}
