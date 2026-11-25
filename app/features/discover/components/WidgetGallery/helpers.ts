import i18n from "@locale";
import { toast } from "sonner";

import {
  BOARD_COLUMNS,
  BOARD_GAP_PX,
  BOARD_ROW_PX,
  DEFAULT_BOARD_ROW_HEIGHT,
  type BoardSpan,
} from "@components/BoardGrid";
import { SOURCE_NAMES } from "@components/SourceBadge";
import type { BoardItem, BoardList, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";
import type {
  FeedIntegration,
  WidgetBlock,
  WidgetCatalog,
  WidgetDocument,
  WidgetDraft,
  WidgetPreset,
  WidgetProblem,
} from "@hooks/api/queries/widgets/types";
import { playbackServerName } from "@utils/playback-servers";

import {
  BOARD_CATEGORY_ORDER,
  BOARD_LISTS,
  BOARD_MAX_ITEMS,
  BOARD_WIDGET_ORDER,
  BOARD_WIDGETS,
  CUSTOM_BLOCK_ROW_HEIGHTS,
} from "../ExploreBoard/constants";
import { spanOf } from "../ExploreBoard/helpers";
import type { BoardCategory } from "../ExploreBoard/types";
import { BYTES_PER_KB, GALLERY_BOARD_FILTERS, GALLERY_SERVERS, PREVIEW_BOARD_WIDTH, PREVIEW_BOX } from "./constants";
import type {
  BulkAddRoom,
  BulkPlacement,
  GalleryBoardFilter,
  GalleryCategoryFilter,
  GalleryEntry,
  GalleryFilters,
  GalleryGroup,
  GalleryServer,
  GallerySort,
  GallerySource,
  GallerySourceFilter,
  GallerySourceRow,
  LayoutPlacement,
  PreviewBox,
  PreviewFrame,
  SourcePill,
  SourceReasonKey,
  SourceStatus,
} from "./types";

export function matchesQuery(entry: GalleryEntry, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return [entry.name, entry.description].some((text) => text.toLocaleLowerCase().includes(needle));
}

function compareEntries(sort: GallerySort, onBoard: ReadonlyMap<BoardWidgetKey, string>) {
  const curated = (entry: GalleryEntry) => BOARD_WIDGET_ORDER.indexOf(entry.widget);
  const category = (entry: GalleryEntry) => BOARD_CATEGORY_ORDER.indexOf(entry.definition.category);
  return (left: GalleryEntry, right: GalleryEntry): number => {
    switch (sort) {
      case "suggested":
        return curated(left) - curated(right);
      case "name":
        return left.name.localeCompare(right.name, i18n.language);
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

export function availableEntries(
  entries: readonly GalleryEntry[],
  active: readonly FeedIntegration[] | undefined,
  onBoard: ReadonlyMap<BoardWidgetKey, string>
): GalleryEntry[] {
  return entries.filter((entry) => {
    const { integration } = entry.definition;
    if (integration === undefined || onBoard.has(entry.widget)) return true;
    return active !== undefined && active.includes(integration);
  });
}

export function sourceMatches(filter: GallerySourceFilter, entry: GalleryEntry): boolean {
  const { integration } = entry.definition;
  switch (filter) {
    case "all":
      return true;
    case "synthseek":
      return integration === undefined;
    case "lastfm":
    case "listenbrainz":
      return integration === filter;
    case "mediaServer":
    case "plex":
    case "jellyfin":
    case "navidrome":
      return integration === "mediaServer";
  }
}

function serverPill(server: GalleryServer): SourcePill {
  return { source: server, label: playbackServerName(server) };
}

function anyServerLabel(): string {
  const names = GALLERY_SERVERS.map(playbackServerName);
  return new Intl.ListFormat(i18n.language, { type: "disjunction" }).format(names);
}

const LASTFM_PILL: SourcePill = { source: "lastfm", label: SOURCE_NAMES.lastfm };
const LISTENBRAINZ_PILL: SourcePill = { source: "listenbrainz", label: SOURCE_NAMES.listenbrainz };

export function gallerySourceRows(
  catalog: WidgetCatalog | undefined,
  entries: readonly GalleryEntry[]
): GallerySourceRow[] {
  const countOf = (integration: FeedIntegration) =>
    entries.filter((entry) => entry.definition.integration === integration).length;
  const row = (
    source: GallerySource,
    pills: readonly SourcePill[],
    count: number,
    status: SourceStatus,
    reason: SourceReasonKey | null
  ): GallerySourceRow => ({
    source,
    pills,
    label: source === "mediaServer" ? anyServerLabel() : pills.map((pill) => pill.label).join(", "),
    count,
    status,
    reason,
  });
  const anyServerPills = GALLERY_SERVERS.map(serverPill);
  if (!catalog) {
    return [
      row("lastfm", [LASTFM_PILL], countOf("lastfm"), "unknown", "unknown"),
      row("listenbrainz", [LISTENBRAINZ_PILL], countOf("listenbrainz"), "unknown", "unknown"),
      row("mediaServer", anyServerPills, countOf("mediaServer"), "unknown", "unknown"),
    ];
  }
  const { lastfmState, servers } = catalog.feeds;
  const lastfmReason: SourceReasonKey | null =
    lastfmState === "active" ? null : lastfmState === "refused" ? "lastfmRefused" : "lastfmNotSetUp";
  const serverRows =
    servers.length > 0
      ? servers.map((server) => row(server, [serverPill(server)], countOf("mediaServer"), "active", null))
      : [row("mediaServer", anyServerPills, countOf("mediaServer"), "inactive", "noMediaServer")];
  return [
    row("lastfm", [LASTFM_PILL], countOf("lastfm"), lastfmReason ? "inactive" : "active", lastfmReason),
    row("listenbrainz", [LISTENBRAINZ_PILL], countOf("listenbrainz"), "active", null),
    ...serverRows,
  ];
}

export function pickedSourceRow(
  rows: readonly GallerySourceRow[],
  filter: GallerySourceFilter
): GallerySourceRow | null {
  return rows.find((row) => row.source === filter) ?? null;
}

export function sourceFilterOf(rows: readonly GallerySourceRow[], value: string): GallerySourceFilter | null {
  if (value === "all" || value === "synthseek") return value;
  return rows.find((row) => row.source === value)?.source ?? null;
}

export function sourceFilterLabel(rows: readonly GallerySourceRow[], filter: GallerySourceFilter): string | null {
  if (filter === "all") return null;
  if (filter === "synthseek") return i18n.t("widgets:gallery.sources.synthseek");
  return pickedSourceRow(rows, filter)?.label ?? null;
}

export function cardPillsOf(integration: FeedIntegration | undefined, servers: readonly GalleryServer[]): SourcePill[] {
  switch (integration) {
    case undefined:
      return [];
    case "lastfm":
      return [LASTFM_PILL];
    case "listenbrainz":
      return [LISTENBRAINZ_PILL];
    case "mediaServer":
      return servers.map(serverPill);
    case "plex":
    case "jellyfin":
    case "navidrome":
      return [serverPill(integration)];
    case "bandsintown":
    case "lidarr":
      return [{ source: integration, label: SOURCE_NAMES[integration] }];
  }
}

export function presetPeriodOf(preset: WidgetPreset | undefined): string | null {
  const query = preset?.draft.query;
  if (query?.type !== "feed") return null;
  switch (query.source) {
    case "lastfm.topTracks":
    case "lastfm.topArtists":
      return i18n.t(`widgets:feeds.periods.${query.params.period}`);
    case "listenbrainz.topTracks":
    case "listenbrainz.topArtists":
    case "listenbrainz.charts":
      return i18n.t(`widgets:feeds.ranges.${query.params.range}`);
    default:
      return null;
  }
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
  return frameOfSpan(spanOf(BOARD_WIDGETS[widget].defaultSize, DEFAULT_BOARD_ROW_HEIGHT, "wide"), PREVIEW_BOX);
}

export function customPreviewFrame(block: WidgetBlock, size: BoardSize, width?: number): PreviewFrame {
  const span = spanOf(size, CUSTOM_BLOCK_ROW_HEIGHTS[block] ?? DEFAULT_BOARD_ROW_HEIGHT, "wide");
  return frameOfSpan(span, width ? { width, height: Number.POSITIVE_INFINITY } : PREVIEW_BOX);
}

export function isBoardFilter(value: string): value is GalleryBoardFilter {
  return GALLERY_BOARD_FILTERS.some((filter) => filter === value);
}

export function customTilesOf(items: readonly BoardItem[], widgetId: string): number {
  return items.filter((item) => item.kind === "custom" && item.widgetId === widgetId).length;
}

export function layoutPlacementOf(onList: (list: BoardList) => boolean): LayoutPlacement {
  const placed = BOARD_LISTS.filter(onList);
  return { placed, free: BOARD_LISTS.filter((list) => !placed.includes(list)) };
}

export function bulkPlacementOf(
  widgets: readonly BoardWidgetKey[],
  onList: (list: BoardList, widget: BoardWidgetKey) => boolean
): BulkPlacement {
  return {
    addable: BOARD_LISTS.filter((list) => widgets.some((widget) => !onList(list, widget))),
    removable: BOARD_LISTS.filter((list) => widgets.some((widget) => onList(list, widget))),
  };
}

export function bulkAddRoomOf(
  widgets: readonly BoardWidgetKey[],
  targets: readonly BoardList[],
  lists: Record<BoardList, readonly BoardItem[]>,
  onList: (list: BoardList, widget: BoardWidgetKey) => boolean
): BulkAddRoom {
  const fits = targets.filter((list) => {
    const missing = widgets.filter((widget) => !onList(list, widget)).length;
    return lists[list].length + missing <= BOARD_MAX_ITEMS;
  });
  return { fits, full: targets.filter((list) => !fits.includes(list)) };
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
    query:
      query.type === "feed" && query.source === "lastfm.charts" && query.params.country === null
        ? { ...query, params: { country } }
        : query,
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
    case "setRuleNotAllowed":
      return i18n.t("widgets:problems.setRuleNotAllowed", {
        field: i18n.t(`widgets:rules.fields.${problem.field}`),
      });
    case "setSlotNeedsParam":
      return i18n.t("widgets:problems.setSlotNeedsParam", {
        origin: i18n.t(`widgets:set.origins.${problem.origin}`),
      });
    case "setSlotParamInvalid":
      return i18n.t("widgets:problems.setSlotParamInvalid", {
        origin: i18n.t(`widgets:set.origins.${problem.origin}`),
      });
    case "setSlotDuplicate":
      return i18n.t("widgets:problems.setSlotDuplicate");
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
