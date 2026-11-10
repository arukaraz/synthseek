"use client";

import { Search } from "lucide-react";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useMyWidgets } from "@hooks/api/queries/widgets/useMyWidgets";

import { NEW_WIDGET_DRAFT } from "../../constants";
import { BOARD_WIDGET_ORDER, BOARD_WIDGETS } from "../ExploreBoard/constants";
import { widgetsOnBoard } from "../ExploreBoard/helpers";
import { NeverIncludeCard } from "../NeverInclude/NeverIncludeCard";
import { CategoryBand } from "../WidgetGallery/CategoryBand";
import { GALLERY_MODES } from "../WidgetGallery/constants";
import { GalleryFilterMenu } from "../WidgetGallery/GalleryFilterMenu";
import { categoryCounts, draftOf, galleryGroups, layoutPlacementOf } from "../WidgetGallery/helpers";
import { MyWidgetsPanel } from "../WidgetGallery/MyWidgetsPanel";
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
import { WidgetGalleryCard } from "../WidgetGallery/WidgetGalleryCard";
import { neverIncludeSlot } from "./styles";
import type { WidgetsSectionProps } from "./types";

export function WidgetsSection({ draft, gallery, filters, onFiltersChange, onImport }: WidgetsSectionProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const myWidgets = useMyWidgets();
  const lists = draft.draft;

  const entries = useMemo(
    () =>
      BOARD_WIDGET_ORDER.map((widget) => {
        const definition = BOARD_WIDGETS[widget];
        return { widget, definition, title: t(definition.titleKey), description: t(definition.descriptionKey) };
      }),
    [t]
  );
  const onBoard = useMemo(() => widgetsOnBoard([...lists.items, ...lists.mobile]), [lists]);
  const onList = useMemo(() => ({ items: widgetsOnBoard(lists.items), mobile: widgetsOnBoard(lists.mobile) }), [lists]);
  const groups = galleryGroups(entries, filters, onBoard);
  const counts = useMemo(() => categoryCounts(entries), [entries]);

  return (
    <>
      <div className={galleryToolbar()}>
        {gallery.mode === "widgets" ? (
          <div className={galleryFilters()}>
            <GalleryFilterMenu filters={filters} counts={counts} onChange={onFiltersChange} />
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
                {group.entries.map((entry) => {
                  const placement = layoutPlacementOf((list) => onList[list].has(entry.widget));
                  return (
                    <WidgetGalleryCard
                      key={entry.widget}
                      entry={entry}
                      placed={placement.placed}
                      free={placement.free}
                      onAdd={draft.addWidget}
                      onRemove={draft.removeWidget}
                      onCustomize={
                        gallery.canCustomize(entry.widget) ? () => gallery.customize(entry.widget) : undefined
                      }
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
