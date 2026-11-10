import type { BoardAppearance, BoardList, BoardLists, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDocument, WidgetDraft } from "@hooks/api/queries/widgets/types";

import type { BoardArrangeState } from "../BoardArrange/types";
import type { StagedTemplate } from "../BoardSettings/types";
import type { BoardBackground, BoardCustomWidgets, BoardSave, WidgetsDialogOpening } from "../ExploreBoard/types";
import type { GalleryFilters, GalleryMode } from "../WidgetGallery/types";
import type { WorkshopOpening } from "../WidgetWorkshop/types";

export interface WidgetsDialogProps {
  lists: BoardLists;
  opening: WidgetsDialogOpening;
  custom: BoardCustomWidgets;
  onSave: (save: BoardSave) => void;
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
  settle: () => void;
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

export interface WidgetsSectionProps {
  draft: CustomizationDraft;
  gallery: GalleryWorkshop;
  filters: GalleryFilters;
  onFiltersChange: (filters: GalleryFilters) => void;
  onImport: () => void;
}
