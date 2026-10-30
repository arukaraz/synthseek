"use client";

import { Search } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { Input } from "@components/ui/Input";
import { SectionLoading } from "@components/ui/SectionLoading";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useMyWidgets } from "@hooks/api/queries/widgets/useMyWidgets";
import { useWidgetCatalog } from "@hooks/api/queries/widgets/useWidgetCatalog";
import { useWidgetGrammar } from "@hooks/api/queries/widgets/useWidgetGrammar";
import { useWidgetHousehold } from "@hooks/api/queries/widgets/useWidgetHousehold";
import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";
import type { BoardWidgetKey } from "@hooks/api/queries/board/types";
import type { WidgetDraft } from "@hooks/api/queries/widgets/types";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";
import { useCountry } from "@modules/providers/CountryProvider";

import { NEW_WIDGET_DRAFT } from "../../constants";
import { BOARD_WIDGET_ORDER, BOARD_WIDGETS } from "../ExploreBoard/constants";
import { widgetsOnBoard } from "../ExploreBoard/helpers";
import type { WorkshopOpening } from "../WidgetWorkshop/types";
import { WidgetWorkshop } from "../WidgetWorkshop/WidgetWorkshop";
import { CategoryBand } from "./CategoryBand";
import { DEFAULT_GALLERY_FILTERS, GALLERY_MODES } from "./constants";
import { GalleryFilterMenu } from "./GalleryFilterMenu";
import { categoryCounts, customizedDraftOf, draftOf, galleryGroups, presetFor } from "./helpers";
import { ImportWidgetDialog } from "./ImportWidgetDialog";
import { MyWidgetsPanel } from "./MyWidgetsPanel";
import {
  galleryDialog,
  galleryEmpty,
  galleryGrid,
  galleryHeader,
  gallerySearch,
  galleryScroll,
  galleryTitleBlock,
  galleryToolbar,
  galleryToolbarEnd,
  searchField,
  searchIcon,
  visuallyHidden,
} from "./styles";
import type { GalleryFilters, GalleryLeave, GalleryMode, WidgetGalleryProps } from "./types";
import { WidgetGalleryCard } from "./WidgetGalleryCard";

export function WidgetGallery({ items, customize, onAdd, onAddCustom, onRemove, onClose }: WidgetGalleryProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const [mode, setMode] = useState<GalleryMode>("widgets");
  const [filters, setFilters] = useState<GalleryFilters>(DEFAULT_GALLERY_FILTERS);
  const [opening, setOpening] = useState<WorkshopOpening | null>(null);
  const [returnTo, setReturnTo] = useState<GalleryMode>("mine");
  const [pendingCustomize, setPendingCustomize] = useState(customize);
  const [dirty, setDirty] = useState(false);
  const [leaving, setLeaving] = useState<GalleryLeave | null>(null);
  const [importing, setImporting] = useState(false);
  const wide = useBoardDevice() === "wide";
  const myWidgets = useMyWidgets();
  const catalog = useWidgetCatalog();
  const grammar = useWidgetGrammar();
  const presets = useWidgetPresets();
  const household = useWidgetHousehold();
  const { country } = useCountry();

  const entries = useMemo(
    () =>
      BOARD_WIDGET_ORDER.map((widget) => {
        const definition = BOARD_WIDGETS[widget];
        return { widget, definition, title: t(definition.titleKey), description: t(definition.descriptionKey) };
      }),
    [t]
  );
  const onBoard = useMemo(() => widgetsOnBoard(items), [items]);
  const groups = galleryGroups(entries, filters, onBoard);
  const counts = useMemo(() => categoryCounts(entries), [entries]);

  const openWorkshop = useCallback((draft: WidgetDraft, widgetId: string | null, from: GalleryMode) => {
    setDirty(false);
    setReturnTo(from);
    setOpening({ draft, widgetId, purpose: "widget" });
  }, []);

  const customizeWidget = useCallback(
    (widget: BoardWidgetKey) => {
      const preset = presetFor(presets.data, widget);
      if (preset) {
        openWorkshop(customizedDraftOf(preset, t(BOARD_WIDGETS[widget].titleKey), country), null, "widgets");
      }
    },
    [country, openWorkshop, presets.data, t]
  );

  useEffect(() => {
    if (!pendingCustomize || !presets.data) return;
    setPendingCustomize(null);
    customizeWidget(pendingCustomize);
  }, [customizeWidget, pendingCustomize, presets.data]);

  const leave = useCallback(
    (kind: GalleryLeave) => {
      setLeaving(null);
      if (kind === "close") {
        onClose();
        return;
      }
      setOpening(null);
      setDirty(false);
      setMode(returnTo);
    },
    [onClose, returnTo]
  );

  const requestLeave = useCallback(
    (kind: GalleryLeave) => {
      if (opening && dirty) setLeaving(kind);
      else leave(kind);
    },
    [dirty, leave, opening]
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) requestLeave("close");
      }}
    >
      <DialogContent
        animation="panel"
        className={galleryDialog({ workshop: opening !== null })}
        onOpenAutoFocus={(event) => {
          if (!wide || opening) event.preventDefault();
        }}
      >
        {opening ? (
          <>
            {catalog.data && grammar.data && presets.data ? (
              <WidgetWorkshop
                opening={opening}
                context={{
                  catalog: catalog.data,
                  grammar: grammar.data,
                  presets: presets.data,
                  country,
                  people: household.data ?? [],
                }}
                onLeave={() => requestLeave("back")}
                onDirtyChange={setDirty}
                onSaved={(name) => {
                  toast.success(t("widgets:mine.saved", { name }));
                  leave("back");
                }}
              />
            ) : (
              <>
                <DialogTitle className={visuallyHidden()}>{t("widgets:workshop.newTitle")}</DialogTitle>
                <SectionLoading />
              </>
            )}
          </>
        ) : (
          <>
            <div className={galleryHeader()}>
              <div className={galleryTitleBlock()}>
                <DialogTitle>{t("board.gallery.title")}</DialogTitle>
                <DialogDescription className={visuallyHidden()}>{t("board.gallery.title")}</DialogDescription>
              </div>
              {mode === "widgets" ? (
                <label className={gallerySearch()}>
                  <Search className={searchIcon()} aria-hidden />
                  <Input
                    type="search"
                    size="sm"
                    value={filters.query}
                    onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                    placeholder={t("board.gallery.search")}
                    aria-label={t("board.gallery.search")}
                    className={searchField()}
                  />
                </label>
              ) : null}
            </div>
            <div className={galleryToolbar()}>
              <SegmentTabs
                items={GALLERY_MODES.map((value) => ({
                  value,
                  label: value === "widgets" ? t("widgets:gallery.tabs.widgets") : t("widgets:gallery.tabs.mine"),
                }))}
                value={mode}
                onValueChange={setMode}
                layoutId="board-gallery-mode"
                ariaLabel={t("widgets:gallery.tabs.label")}
              />
              {mode === "widgets" ? (
                <div className={galleryToolbarEnd()}>
                  <GalleryFilterMenu filters={filters} counts={counts} onChange={setFilters} />
                </div>
              ) : null}
            </div>
            <div className={galleryScroll()}>
              {mode === "mine" ? (
                myWidgets.data ? (
                  <MyWidgetsPanel
                    widgets={myWidgets.data}
                    items={items}
                    onAddCustom={onAddCustom}
                    onEdit={(widget) => openWorkshop(draftOf(widget), widget.id, "mine")}
                    onCreate={() =>
                      openWorkshop(
                        { ...NEW_WIDGET_DRAFT, meta: { ...NEW_WIDGET_DRAFT.meta, name: t("widgets:mine.newWidget") } },
                        null,
                        "mine"
                      )
                    }
                    onImport={() => setImporting(true)}
                  />
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
                      {group.entries.map((entry) => (
                        <WidgetGalleryCard
                          key={entry.widget}
                          entry={entry}
                          tileId={onBoard.get(entry.widget)}
                          onAdd={onAdd}
                          onRemove={onRemove}
                          onCustomize={
                            presetFor(presets.data, entry.widget) ? () => customizeWidget(entry.widget) : undefined
                          }
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        <ConfirmationModal
          isOpen={leaving !== null}
          onClose={() => setLeaving(null)}
          onConfirm={() => {
            if (leaving) leave(leaving);
          }}
          title={t("widgets:workshop.discard.title")}
          message={t("widgets:workshop.discard.message")}
          confirmText={t("widgets:workshop.discard.confirm")}
          cancelText={t("widgets:workshop.discard.keep")}
          variant="warning"
        />
        <ImportWidgetDialog
          open={importing}
          onClose={() => setImporting(false)}
          onImported={(draft) => {
            setImporting(false);
            openWorkshop(draft, null, "mine");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
