"use client";

import { Search } from "lucide-react";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "sonner";

import { Input } from "@components/ui/Input";
import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import type { BoardList, BoardWidgetKey } from "@hooks/api/queries/board/types";
import { useMyWidgets } from "@hooks/api/queries/widgets/useMyWidgets";
import { useWidgetCatalog } from "@hooks/api/queries/widgets/useWidgetCatalog";
import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";

import { NEW_WIDGET_DRAFT } from "../../constants";
import { BOARD_LIST_KEYS, BOARD_MAX_ITEMS, BOARD_WIDGET_ORDER, BOARD_WIDGETS } from "../ExploreBoard/constants";
import { boardWidgetName, widgetsOnBoard } from "../ExploreBoard/helpers";
import { NeverIncludeCard } from "../NeverInclude/NeverIncludeCard";
import { BulkLayoutMenu } from "../WidgetGallery/BulkLayoutMenu";
import { CategoryBand } from "../WidgetGallery/CategoryBand";
import { GALLERY_MODES } from "../WidgetGallery/constants";
import { GalleryFilterMenu } from "../WidgetGallery/GalleryFilterMenu";
import {
  availableEntries,
  bulkAddRoomOf,
  bulkPlacementOf,
  cardPillsOf,
  categoryCounts,
  draftOf,
  galleryGroups,
  gallerySourceRows,
  layoutPlacementOf,
  matchesQuery,
  pickedSourceRow,
  presetFor,
  presetPeriodOf,
  sourceMatches,
} from "../WidgetGallery/helpers";
import { MyWidgetsPanel } from "../WidgetGallery/MyWidgetsPanel";
import { SourceCallout } from "../WidgetGallery/SourceCallout";
import {
  galleryEmpty,
  galleryFilters,
  galleryGrid,
  gallerySearch,
  galleryScroll,
  galleryTabs,
  galleryToolbar,
  searchField,
  searchIcon,
} from "../WidgetGallery/styles";
import type { GalleryEntry } from "../WidgetGallery/types";
import { WidgetGalleryCard } from "../WidgetGallery/WidgetGalleryCard";
import { neverIncludeSlot } from "./styles";
import type { WidgetsSectionProps } from "./types";

export function WidgetsSection({ draft, gallery, filters, onFiltersChange, onImport }: WidgetsSectionProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const myWidgets = useMyWidgets();
  const lists = draft.draft;

  const catalog = useWidgetCatalog();
  const presets = useWidgetPresets();
  const active = catalog.data?.feeds.activeIntegrations;
  const servers = catalog.data?.feeds.servers ?? [];
  const onBoard = useMemo(() => widgetsOnBoard([...lists.items, ...lists.mobile]), [lists]);
  const allEntries = useMemo(
    () =>
      BOARD_WIDGET_ORDER.map((widget) => {
        const definition = BOARD_WIDGETS[widget];
        return {
          widget,
          definition,
          name: boardWidgetName(widget),
          title: t(definition.titleKey),
          description: t(definition.descriptionKey),
        };
      }),
    [t]
  );
  const entries = useMemo(() => availableEntries(allEntries, active, onBoard), [allEntries, active, onBoard]);
  const sourceRows = useMemo(() => gallerySourceRows(catalog.data, allEntries), [catalog.data, allEntries]);
  const picked = pickedSourceRow(sourceRows, filters.source);
  const inactivePick = picked !== null && picked.status !== "active" ? picked : null;
  const sourced = useMemo(
    () => entries.filter((entry) => sourceMatches(filters.source, entry)),
    [entries, filters.source]
  );
  const onList = useMemo(() => ({ items: widgetsOnBoard(lists.items), mobile: widgetsOnBoard(lists.mobile) }), [lists]);
  const groups = inactivePick ? [] : galleryGroups(sourced, filters, onBoard);
  const counts = useMemo(() => categoryCounts(sourced), [sourced]);
  const totals = {
    all: entries.length,
    synthseek: entries.filter((entry) => entry.definition.integration === undefined).length,
  };
  const ghosts = inactivePick
    ? allEntries.filter((entry) => sourceMatches(filters.source, entry) && matchesQuery(entry, filters.query))
    : [];
  const shown = groups.flatMap((group) => group.entries.map((entry) => entry.widget));
  const retry = () => void catalog.refetch();
  const cardOf = (entry: GalleryEntry, ghost: boolean, needs: string | null) => {
    const placement = layoutPlacementOf((list) => onList[list].has(entry.widget));
    return (
      <WidgetGalleryCard
        key={entry.widget}
        entry={entry}
        placed={placement.placed}
        free={placement.free}
        pills={cardPillsOf(entry.definition.integration, servers)}
        period={presetPeriodOf(presetFor(presets.data, entry.widget))}
        ghost={ghost}
        needs={needs}
        onAdd={draft.addWidget}
        onRemove={draft.removeWidget}
        onCustomize={gallery.canCustomize(entry.widget) ? () => gallery.customize(entry.widget) : undefined}
      />
    );
  };
  const isOnList = (list: BoardList, widget: BoardWidgetKey) => onList[list].has(widget);
  const bulk = bulkPlacementOf(shown, isOnList);
  const addShown = (targets: readonly BoardList[]) => {
    const room = bulkAddRoomOf(shown, targets, lists, isOnList);
    shown.forEach((widget) => draft.addWidget(widget, room.fits));
    room.full.forEach((list) =>
      toast.warning(t("board.gallery.bulk.noRoom", { layout: t(BOARD_LIST_KEYS[list]), max: BOARD_MAX_ITEMS }))
    );
  };

  return (
    <>
      <div className={galleryToolbar()}>
        {gallery.mode === "widgets" ? (
          <div className={galleryFilters()}>
            <GalleryFilterMenu
              filters={filters}
              counts={counts}
              sources={{ rows: sourceRows, retry }}
              totals={totals}
              onChange={onFiltersChange}
            />
            <label className={gallerySearch()}>
              <Search className={searchIcon()} aria-hidden />
              <Input
                type="search"
                size="sm"
                value={filters.query}
                onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
                placeholder={t("board.gallery.search")}
                aria-label={t("board.gallery.search")}
                className={searchField()}
              />
            </label>
          </div>
        ) : null}
        {gallery.mode === "widgets" ? (
          <BulkLayoutMenu
            addable={bulk.addable}
            removable={bulk.removable}
            onAdd={addShown}
            onRemove={(targets) => shown.forEach((widget) => draft.removeWidget(widget, targets))}
          />
        ) : null}
        <SegmentTabs
          items={GALLERY_MODES.map((value) => ({ value, label: t(`widgets:gallery.tabs.${value}`) }))}
          value={gallery.mode}
          onValueChange={gallery.setMode}
          layoutId="board-gallery-mode"
          ariaLabel={t("widgets:gallery.tabs.label")}
          className={galleryTabs()}
        />
      </div>
      <div className={galleryScroll()}>
        {gallery.mode === "mine" ? (
          myWidgets.data ? (
            <>
              <MyWidgetsPanel
                widgets={myWidgets.data}
                lists={lists}
                onAddCustom={draft.addCustom}
                onEdit={(widget) => gallery.open(draftOf(widget), widget.id, "mine")}
                onCreate={() =>
                  gallery.open(
                    { ...NEW_WIDGET_DRAFT, meta: { ...NEW_WIDGET_DRAFT.meta, name: t("widgets:mine.newWidget") } },
                    null,
                    "mine"
                  )
                }
                onImport={onImport}
                onDeleted={draft.dropCustom}
              />
              <div className={neverIncludeSlot()}>
                <NeverIncludeCard />
              </div>
            </>
          ) : (
            <SectionLoading />
          )
        ) : inactivePick ? (
          <div className={galleryGrid()}>
            <SourceCallout row={inactivePick} onRetry={retry} />
            {ghosts.map((entry) => {
              const ghost = !entries.includes(entry);
              const known = ghost && inactivePick.status !== "unknown";
              return cardOf(
                entry,
                ghost,
                known ? t("widgets:gallery.sources.needs", { source: inactivePick.label }) : null
              );
            })}
          </div>
        ) : groups.length === 0 ? (
          <p className={galleryEmpty()}>
            {filters.query.trim()
              ? t("board.gallery.empty", { query: filters.query.trim() })
              : t("widgets:gallery.filter.nothing")}
          </p>
        ) : (
          <div className={galleryGrid()}>
            {groups.map((group) => (
              <Fragment key={group.category ?? "all"}>
                {group.category ? (
                  <CategoryBand category={group.category} onBoard={group.onBoard} total={group.entries.length} />
                ) : null}
                {group.entries.map((entry) => cardOf(entry, false, null))}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
