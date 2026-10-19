"use client";

import { Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { Input } from "@components/ui/Input";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import type { SegmentTabItem } from "@components/ui/SegmentTabs/types";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";

import {
  BOARD_CATEGORY_KEYS,
  BOARD_CATEGORY_ORDER,
  BOARD_WIDGET_ORDER,
  BOARD_WIDGETS,
} from "../ExploreBoard/constants";
import { widgetsOnBoard } from "../ExploreBoard/helpers";
import { CategoryBand } from "./CategoryBand";
import { countInCategory, galleryGroups } from "./helpers";
import {
  galleryDialog,
  galleryEmpty,
  galleryGrid,
  galleryHeader,
  gallerySearch,
  galleryScroll,
  galleryTabs,
  galleryTitleBlock,
  searchField,
  searchIcon,
} from "./styles";
import type { GalleryFilter, WidgetGalleryProps } from "./types";
import { WidgetGalleryCard } from "./WidgetGalleryCard";

export function WidgetGallery({ items, onAdd, onRemove, onClose }: WidgetGalleryProps) {
  const { t } = useTranslation("discover");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const wide = useBoardDevice() === "wide";

  const entries = useMemo(
    () =>
      BOARD_WIDGET_ORDER.map((widget) => {
        const definition = BOARD_WIDGETS[widget];
        return { widget, definition, title: t(definition.titleKey), description: t(definition.descriptionKey) };
      }),
    [t]
  );
  const onBoard = useMemo(() => widgetsOnBoard(items), [items]);
  const groups = galleryGroups(entries, query, filter, onBoard);
  const tabs: SegmentTabItem<GalleryFilter>[] = [
    { value: "all", label: t("board.gallery.all"), count: entries.length },
    ...BOARD_CATEGORY_ORDER.map((category) => ({
      value: category,
      label: t(BOARD_CATEGORY_KEYS[category].title),
      count: countInCategory(entries, category),
    })),
  ];

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        animation="panel"
        className={galleryDialog()}
        onOpenAutoFocus={(event) => {
          if (!wide) event.preventDefault();
        }}
      >
        <div className={galleryHeader()}>
          <div className={galleryTitleBlock()}>
            <DialogTitle>{t("board.gallery.title")}</DialogTitle>
            <DialogDescription>
              {t("board.gallery.summary", { onBoard: onBoard.size, total: entries.length })}
            </DialogDescription>
          </div>
          <label className={gallerySearch()}>
            <Search className={searchIcon()} aria-hidden />
            <Input
              type="search"
              size="sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("board.gallery.search")}
              aria-label={t("board.gallery.search")}
              className={searchField()}
            />
          </label>
        </div>
        <SegmentTabs
          items={tabs}
          value={filter}
          onValueChange={setFilter}
          layoutId="board-gallery-filter"
          ariaLabel={t("board.gallery.title")}
          className={galleryTabs()}
        />
        <div className={galleryScroll()}>
          {groups.length === 0 ? (
            <p className={galleryEmpty()}>{t("board.gallery.empty", { query: query.trim() })}</p>
          ) : (
            <div className={galleryGrid()}>
              {groups.map((group) => (
                <Fragment key={group.category}>
                  {groups.length > 1 ? (
                    <CategoryBand category={group.category} onBoard={group.onBoard} total={group.entries.length} />
                  ) : null}
                  {group.entries.map((entry) => (
                    <WidgetGalleryCard
                      key={entry.widget}
                      entry={entry}
                      tileId={onBoard.get(entry.widget)}
                      onAdd={onAdd}
                      onRemove={onRemove}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
