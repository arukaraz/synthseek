import type { BoardDevice } from "@components/BoardGrid";
import type {
  BoardAppearance,
  BoardList,
  BoardLists,
  BoardTemplateApplied,
  BoardWidgetKey,
} from "@hooks/api/queries/board/types";
import type { WidgetDocument, WidgetDraft } from "@hooks/api/queries/widgets/types";

import type { BoardArrangeState } from "../BoardArrange/types";
import type { BoardSettingsTab, StagedTemplate, StageTemplate } from "../BoardSettings/types";
import type {
  BoardBackground,
  BoardCustomizationOpening,
  BoardCustomizationSave,
  BoardCustomWidgets,
  CustomizationSection,
  CustomWidgetsStatus,
} from "../ExploreBoard/types";
import type { GalleryFilters, GalleryMode } from "../WidgetGallery/types";
import type { WorkshopOpening } from "../WidgetWorkshop/types";

export interface BoardCustomizationDialogProps {
  lists: BoardLists;
  device: BoardDevice;
  opening: BoardCustomizationOpening;
  appearance?: BoardAppearance;
  custom: BoardCustomWidgets;
  customStatus: CustomWidgetsStatus;
  onSave: (save: BoardCustomizationSave) => void;
  onTemplateApplied: (applied: BoardTemplateApplied) => void;
  onClose: () => void;
}

export interface UseCustomizationDraftOptions {
  lists: BoardLists;
  appearance?: BoardAppearance;
  custom: BoardCustomWidgets;
}

export interface CustomizationDraft {
  arranges: Record<BoardList, BoardArrangeState>;
  draft: BoardLists;
  previewCustom: BoardCustomWidgets;
  stagedIds: ReadonlySet<string>;
  staged: StagedTemplate | null;
  styled: BoardAppearance | null;
  shownAppearance?: BoardAppearance;
  restyled: boolean;
  rearranged: boolean;
  dirty: boolean;
  background: BoardBackground;
  setStyled: (appearance: BoardAppearance) => void;
  setBackgrounds: (shown: boolean) => void;
  addWidget: (widget: BoardWidgetKey, lists: readonly BoardList[]) => void;
  removeWidget: (widget: BoardWidgetKey, lists: readonly BoardList[]) => void;
  addCustom: (widget: WidgetDocument, lists: readonly BoardList[]) => void;
  dropCustom: (widgetId: string) => void;
  stage: (staged: StagedTemplate) => void;
  unstage: () => void;
}

export interface GalleryWorkshop {
  mode: GalleryMode;
  setMode: (mode: GalleryMode) => void;
  opening: WorkshopOpening | null;
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  open: (draft: WidgetDraft, widgetId: string | null, from: GalleryMode, customizing?: string) => void;
  canCustomize: (widget: BoardWidgetKey) => boolean;
  customize: (widget: BoardWidgetKey) => void;
  back: () => void;
}

export interface CustomizationNavProps {
  value: CustomizationSection;
  onValueChange: (section: CustomizationSection) => void;
}

export type BoardPane = "arrange" | "settings";

export type PhonePane = "arrange" | BoardSettingsTab | "widgets";

export interface CustomizationTabBarProps {
  value: PhonePane;
  onValueChange: (pane: PhonePane) => void;
}

export interface BoardSectionProps {
  draft: CustomizationDraft;
  saved: BoardLists;
  list: BoardList;
  onListChange: (list: BoardList) => void;
  tab: BoardSettingsTab;
  onTabChange: (tab: BoardSettingsTab) => void;
  pane: BoardPane;
  boardWidth: number;
  customStatus: CustomWidgetsStatus;
  onStage: StageTemplate;
}

export interface WidgetsSectionProps {
  draft: CustomizationDraft;
  gallery: GalleryWorkshop;
  filters: GalleryFilters;
  onFiltersChange: (filters: GalleryFilters) => void;
  onImport: () => void;
}
