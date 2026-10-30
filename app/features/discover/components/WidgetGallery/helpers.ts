import i18n from "@locale";
import { toast } from "sonner";

import { BOARD_COLUMNS, BOARD_GAP_PX, BOARD_ROW_PX, BOARD_SPANS, type BoardSpan } from "@components/BoardGrid";
import type { BoardItem, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type {
  WidgetBlock,
  WidgetDocument,
  WidgetDraft,
  WidgetPreset,
  WidgetProblem,
} from "@hooks/api/queries/widgets/types";

import {
  BOARD_CATEGORY_ORDER,
  BOARD_WIDGET_ORDER,
  BOARD_WIDGETS,
  CUSTOM_BLOCK_HEIGHTS,
} from "../ExploreBoard/constants";
import { spanOf } from "../ExploreBoard/helpers";
import type { BoardCategory } from "../ExploreBoard/types";
import { BYTES_PER_KB, GALLERY_BOARD_FILTERS, PREVIEW_BOARD_WIDTH, PREVIEW_BOX } from "./constants";
import type {
  GalleryBoardFilter,
  GalleryCategoryFilter,
  GalleryEntry,
  GalleryFilters,
  GalleryGroup,
  GallerySort,
  PreviewBox,
  PreviewFrame,
} from "./types";

export function matchesQuery(entry: GalleryEntry, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return [entry.title, entry.description].some((text) => text.toLocaleLowerCase().includes(needle));
}

function compareEntries(sort: GallerySort, onBoard: ReadonlyMap<BoardWidgetKey, string>) {
  const curated = (entry: GalleryEntry) => BOARD_WIDGET_ORDER.indexOf(entry.widget);
  const category = (entry: GalleryEntry) => BOARD_CATEGORY_ORDER.indexOf(entry.definition.category);
  return (left: GalleryEntry, right: GalleryEntry): number => {
    switch (sort) {
      case "suggested":
        return curated(left) - curated(right);
      case "name":
        return left.title.localeCompare(right.title, i18n.language);
      case "category":
        return category(left) - category(right) || curated(left) - curated(right);
      case "onBoardFirst":
        return Number(onBoard.has(right.widget)) - Number(onBoard.has(left.widget)) || curated(left) - curated(right);
    }
  };
}

function boardMatches(filters: GalleryFilters, entry: GalleryEntry, onBoard: ReadonlyMap<BoardWidgetKey, string>) {
  if (filters.board === "all") return true;
  return onBoard.has(entry.widget) === (filters.board === "on");
}

export function galleryGroups(
  entries: readonly GalleryEntry[],
  filters: GalleryFilters,
  onBoard: ReadonlyMap<BoardWidgetKey, string>
): GalleryGroup[] {
  const searching = filters.query.trim() !== "";
  const matching = entries
    .filter((entry) => searching || filters.category === "all" || entry.definition.category === filters.category)
    .filter((entry) => matchesQuery(entry, filters.query) && boardMatches(filters, entry, onBoard))
    .sort(compareEntries(filters.sort, onBoard));
  const ordered = filters.direction === "desc" ? matching.reverse() : matching;
  const countOnBoard = (list: readonly GalleryEntry[]) => list.filter((entry) => onBoard.has(entry.widget)).length;
  if (filters.sort !== "category") {
    return ordered.length === 0 ? [] : [{ category: null, entries: ordered, onBoard: countOnBoard(ordered) }];
  }
  const categories = filters.direction === "desc" ? [...BOARD_CATEGORY_ORDER].reverse() : BOARD_CATEGORY_ORDER;
  return categories
    .map((category) => {
      const inCategory = ordered.filter((entry) => entry.definition.category === category);
      return { category, entries: inCategory, onBoard: countOnBoard(inCategory) };
    })
    .filter((group) => group.entries.length > 0);
}

export function countInCategory(entries: readonly GalleryEntry[], category: BoardCategory): number {
  return entries.filter((entry) => entry.definition.category === category).length;
}

export function categoryCounts(entries: readonly GalleryEntry[]): Map<GalleryCategoryFilter, number> {
  return new Map<GalleryCategoryFilter, number>([
    ["all", entries.length],
    ...BOARD_CATEGORY_ORDER.map((category): [GalleryCategoryFilter, number] => [
      category,
      countInCategory(entries, category),
    ]),
  ]);
}

function frameOfSpan(span: BoardSpan, box: PreviewBox): PreviewFrame {
  const columns = BOARD_COLUMNS.wide;
  const column = (PREVIEW_BOARD_WIDTH - (columns - 1) * BOARD_GAP_PX) / columns;
  const stageWidth = span.cols * column + (span.cols - 1) * BOARD_GAP_PX;
  const stageHeight = span.rows * BOARD_ROW_PX + (span.rows - 1) * BOARD_GAP_PX;
  const scale = Math.min(1, box.width / stageWidth, box.height / stageHeight);
  return {
    stageWidth,
    stageHeight,
    scale,
    width: Math.round(stageWidth * scale),
    height: Math.round(stageHeight * scale),
  };
}

export function previewFrame(widget: BoardWidgetKey): PreviewFrame {
  return frameOfSpan(spanOf(widget, BOARD_WIDGETS[widget].defaultSize, "wide"), PREVIEW_BOX);
}

export function customPreviewFrame(block: WidgetBlock, size: BoardSize, width?: number): PreviewFrame {
  const span = BOARD_SPANS.wide[size][CUSTOM_BLOCK_HEIGHTS[block][size]];
  return frameOfSpan(span, width ? { width, height: Number.POSITIVE_INFINITY } : PREVIEW_BOX);
}

export function isBoardFilter(value: string): value is GalleryBoardFilter {
  return GALLERY_BOARD_FILTERS.some((filter) => filter === value);
}

export function customTilesOf(items: readonly BoardItem[], widgetId: string): number {
  return items.filter((item) => item.kind === "custom" && item.widgetId === widgetId).length;
}

export function draftOf(widget: WidgetDocument): WidgetDraft {
  const { id: _id, ...draft } = widget;
  return draft;
}

export function duplicateOf(widget: WidgetDocument, name: string): WidgetDraft {
  return { ...draftOf(widget), meta: { ...widget.meta, name } };
}

export function presetFor(
  presets: readonly WidgetPreset[] | undefined,
  widget: BoardWidgetKey
): WidgetPreset | undefined {
  return presets?.find((preset) => preset.builtin === widget);
}

export function customizedDraftOf(preset: WidgetPreset, title: string, country: string): WidgetDraft {
  const { query } = preset.draft;
  return {
    ...preset.draft,
    query: query.type === "feed" && query.source === "lastfm.charts" ? { ...query, params: { country } } : query,
    meta: { ...preset.draft.meta, name: i18n.t("widgets:customize.name", { name: title }) },
    basedOn: title,
  };
}

export function draftJsonOf(draft: WidgetDraft): string {
  return JSON.stringify(draft, null, 2);
}

export function exportJsonOf(widget: WidgetDocument): string {
  return draftJsonOf(draftOf(widget));
}

export function copyWidgetJson(json: string, name: string): void {
  void navigator.clipboard
    .writeText(json)
    .then(() => toast.success(i18n.t("widgets:mine.jsonCopied", { name })))
    .catch(() => toast.error(i18n.t("widgets:mine.jsonCopyFailed")));
}

export function problemText(problem: WidgetProblem): string {
  switch (problem.code) {
    case "measureNotForSubject":
      return i18n.t("widgets:problems.measureNotForSubject", {
        measure: i18n.t(`widgets:measures.${problem.measure}`),
        subject: i18n.t(`widgets:subjects.${problem.subject}`),
      });
    case "rankDeltaNeedsCompare":
      return i18n.t("widgets:problems.rankDeltaNeedsCompare");
    case "groupByNotForSubject":
      return i18n.t("widgets:problems.groupByNotForSubject", {
        subject: i18n.t(`widgets:subjects.${problem.subject}`),
      });
    case "groupByNotForMeasure":
      return i18n.t("widgets:problems.groupByNotForMeasure", {
        measure: i18n.t(`widgets:measures.${problem.measure}`),
      });
    case "pickByNotMeasure":
      return i18n.t("widgets:problems.pickByNotMeasure", { measure: i18n.t(`widgets:measures.${problem.measure}`) });
    case "ruleNotForSubject":
      return i18n.t("widgets:problems.ruleNotForSubject", {
        field: i18n.t(`widgets:rules.fields.${problem.field}`),
        subject: i18n.t(`widgets:subjects.${problem.subject}`),
      });
    case "ruleNotForSource":
      return i18n.t("widgets:problems.ruleNotForSource", {
        field: i18n.t(`widgets:rules.fields.${problem.field}`),
        source: i18n.t(`widgets:feeds.sources.${problem.source}`),
      });
    case "pickByNotForSource":
      return i18n.t("widgets:problems.pickByNotForSource", {
        by: i18n.t(`widgets:feeds.pickBy.${problem.by}`),
        source: i18n.t(`widgets:feeds.sources.${problem.source}`),
      });
    case "blockNotForShape":
      return i18n.t("widgets:problems.blockNotForShape", { block: i18n.t(`widgets:blocks.${problem.block}`) });
    case "playlistNeedsTracks":
      return i18n.t("widgets:problems.playlistNeedsTracks");
    case "userRuleOnce":
      return i18n.t("widgets:problems.userRuleOnce");
    case "userRuleNeedsAll":
      return i18n.t("widgets:problems.userRuleNeedsAll");
    case "tooLarge":
      return i18n.t("widgets:problems.tooLarge", { kb: Math.round(problem.maxBytes / BYTES_PER_KB) });
    case "invalidJson":
      return i18n.t("widgets:problems.invalidJson");
    case "invalidField":
      return i18n.t("widgets:problems.invalidField");
  }
}
