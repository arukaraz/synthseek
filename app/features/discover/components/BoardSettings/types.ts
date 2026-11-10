import type { BoardDevice } from "@components/BoardGrid";
import type { BoardAppearance, BoardList, BoardLists, BoardTemplatePreview } from "@hooks/api/queries/board/types";

import type { SettingsLinkNoteProps } from "../CustomWidget/types";
import type { BoardBackground, BoardCustomWidgets, CustomWidgetsStatus } from "../ExploreBoard/types";
import type { CustomizationDraft } from "../WidgetsDialog/types";
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

export interface PendingTemplate {
  stage: () => void;
}

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

export interface BoardSectionProps {
  draft: CustomizationDraft;
  saved: BoardLists;
  list: BoardList;
  onListChange: (list: BoardList) => void;
  tab: BoardSettingsTab;
  onTabChange: (tab: BoardSettingsTab) => void;
  boardWidth: number;
  customStatus: CustomWidgetsStatus;
  onStage: StageTemplate;
}

export interface BoardSettingsFormProps {
  lists: BoardLists;
  device: BoardDevice;
  appearance?: BoardAppearance;
  custom: BoardCustomWidgets;
  customStatus: CustomWidgetsStatus;
}
