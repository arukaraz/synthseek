"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { ModalActionBar } from "@components/ui/ModalActionBar";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useApplyBoardTemplate } from "@hooks/api/mutations/board/useApplyBoardTemplate";
import type { BoardList } from "@hooks/api/queries/board/types";
import { useWidgetCatalog } from "@hooks/api/queries/widgets/useWidgetCatalog";
import { useWidgetGrammar } from "@hooks/api/queries/widgets/useWidgetGrammar";
import { useWidgetHousehold } from "@hooks/api/queries/widgets/useWidgetHousehold";
import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { useCountry } from "@modules/providers/CountryProvider";

import { useCustomizationDraft } from "../../hooks/useCustomizationDraft";
import { useGalleryWorkshop } from "../../hooks/useGalleryWorkshop";
import { settingsHeader } from "../BoardSettings/styles";
import type { BoardSettingsDiscard, BoardSettingsTab, StageTemplate } from "../BoardSettings/types";
import { BOARD_DEVICE_OF, BOARD_LIST_OF } from "../ExploreBoard/constants";
import type { CustomizationSection } from "../ExploreBoard/types";
import { DEFAULT_GALLERY_FILTERS } from "../WidgetGallery/constants";
import { ImportWidgetDialog } from "../WidgetGallery/ImportWidgetDialog";
import { galleryDialog, visuallyHidden } from "../WidgetGallery/styles";
import type { GalleryFilters, GalleryLeave } from "../WidgetGallery/types";
import { WidgetWorkshop } from "../WidgetWorkshop/WidgetWorkshop";
import { BoardSection } from "./BoardSection";
import { PREVIEW_BOARD_WIDTH_PX } from "./constants";
import { CustomizationNav } from "./CustomizationNav";
import { CustomizationTabBar } from "./CustomizationTabBar";
import { phonePaneOf } from "./helpers";
import { customizationBody, customizationPanel, customizationTitleRow } from "./styles";
import type { BoardCustomizationDialogProps, BoardPane, PhonePane } from "./types";
import { WidgetsSection } from "./WidgetsSection";

export function BoardCustomizationDialog({
  lists,
  device,
  opening,
  appearance,
  custom,
  customStatus,
  onSave,
  onTemplateApplied,
  onClose,
}: BoardCustomizationDialogProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const [section, setSection] = useState<CustomizationSection>(opening.section);
  const [widgetsSeen, setWidgetsSeen] = useState(opening.section === "widgets");
  const [list, setList] = useState<BoardList>(BOARD_LIST_OF[device]);
  const [tab, setTab] = useState<BoardSettingsTab>("appearance");
  const [boardPane, setBoardPane] = useState<BoardPane>("arrange");
  const phone = useMediaQuery(PHONE_QUERY);
  const [filters, setFilters] = useState<GalleryFilters>(DEFAULT_GALLERY_FILTERS);
  const [discard, setDiscard] = useState<BoardSettingsDiscard | null>(null);
  const [leaving, setLeaving] = useState<GalleryLeave | null>(null);
  const [importing, setImporting] = useState(false);
  const draft = useCustomizationDraft({ lists, appearance, custom });
  const gallery = useGalleryWorkshop(opening.target);
  const applyTemplate = useApplyBoardTemplate();
  const catalog = useWidgetCatalog();
  const grammar = useWidgetGrammar();
  const presets = useWidgetPresets();
  const household = useWidgetHousehold();
  const { country } = useCountry();
  const openerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const previewDevice = BOARD_DEVICE_OF[list];
  const boardWidth =
    previewDevice === device && opening.boardWidth > 0 ? opening.boardWidth : PREVIEW_BOARD_WIDTH_PX[previewDevice];
  const workshopOpen = gallery.opening !== null;

  const closeOrConfirm = () => {
    if (draft.dirty) setDiscard({ kind: "close" });
    else onClose();
  };
  const requestClose = () => {
    if (applyTemplate.isPending) return;
    if (workshopOpen && gallery.dirty) setLeaving("close");
    else if (workshopOpen) {
      gallery.back();
      closeOrConfirm();
    } else closeOrConfirm();
  };
  const leave = (kind: GalleryLeave) => {
    setLeaving(null);
    gallery.back();
    if (kind === "close") closeOrConfirm();
  };
  const requestBack = () => {
    if (gallery.dirty) setLeaving("back");
    else gallery.back();
  };
  const showSection = (next: CustomizationSection) => {
    setSection(next);
    if (next === "widgets") setWidgetsSeen(true);
  };
  const showPhonePane = (pane: PhonePane) => {
    if (pane === "widgets") {
      showSection("widgets");
      return;
    }
    showSection("board");
    if (pane === "arrange") {
      setBoardPane("arrange");
      return;
    }
    setBoardPane("settings");
    setTab(pane);
  };
  const stage: StageTemplate = (json, template) => {
    const run = () => draft.stage({ json, template });
    if (draft.dirty) setDiscard({ kind: "template", stage: run });
    else run();
  };
  const discardConfirmed = () => {
    setDiscard(null);
    if (discard?.kind === "template") discard.stage();
    else onClose();
  };
  const save = () => {
    if (draft.staged) {
      applyTemplate.mutate(
        { json: draft.staged.json, layout: draft.draft, appearance: draft.styled ?? undefined },
        { onSuccess: onTemplateApplied }
      );
      return;
    }
    onSave({
      lists: draft.rearranged ? draft.draft : null,
      appearance: draft.restyled && draft.styled && appearance ? { next: draft.styled, previous: appearance } : null,
    });
  };

  const Title = workshopOpen ? "h2" : DialogTitle;
  const Description = workshopOpen ? "p" : DialogDescription;
  const description =
    section === "board"
      ? t("board.arrange.hint")
      : gallery.mode === "mine"
        ? t("widgets:mine.subtitle")
        : t("board.gallery.subtitle");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent
        animation="panel"
        className={galleryDialog({ workshop: true })}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          headerRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (openerRef.current?.isConnected) openerRef.current.focus();
        }}
      >
        {gallery.opening ? (
          catalog.data && grammar.data && presets.data ? (
            <WidgetWorkshop
              opening={gallery.opening}
              context={{
                catalog: catalog.data,
                grammar: grammar.data,
                presets: presets.data,
                country,
                people: household.data ?? [],
              }}
              onLeave={requestBack}
              onDirtyChange={gallery.setDirty}
              onSaved={(name) => {
                toast.success(t("widgets:mine.saved", { name }));
                gallery.back();
              }}
            />
          ) : (
            <>
              <DialogTitle className={visuallyHidden()}>{t("widgets:workshop.newTitle")}</DialogTitle>
              <SectionLoading />
            </>
          )
        ) : null}
        <div hidden={workshopOpen} className={customizationPanel()}>
          <div ref={headerRef} tabIndex={-1} className={settingsHeader()}>
            <div className={customizationTitleRow()}>
              <Title>{t("widgets:board.customization.title")}</Title>
              <InfoTooltip description={description} side="bottom" align="start" />
              <Description className={visuallyHidden()}>{description}</Description>
            </div>
          </div>
          <div className={customizationBody()}>
            <CustomizationNav value={section} onValueChange={showSection} />
            <div role="tabpanel" hidden={section !== "board"} className={customizationPanel()}>
              <BoardSection
                draft={draft}
                saved={lists}
                list={list}
                onListChange={setList}
                tab={tab}
                onTabChange={setTab}
                pane={boardPane}
                boardWidth={boardWidth}
                customStatus={customStatus}
                onStage={stage}
              />
            </div>
            {widgetsSeen ? (
              <div role="tabpanel" hidden={section !== "widgets"} className={customizationPanel()}>
                <WidgetsSection
                  draft={draft}
                  gallery={gallery}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onImport={() => setImporting(true)}
                />
              </div>
            ) : null}
          </div>
          {phone ? (
            <CustomizationTabBar value={phonePaneOf(section, boardPane, tab)} onValueChange={showPhonePane} />
          ) : null}
          <ModalActionBar
            cancel={{ label: t("board.arrange.cancel"), onClick: requestClose }}
            save={{
              label: t("board.arrange.save"),
              onClick: save,
              disabled: !draft.dirty || applyTemplate.isPending,
            }}
          />
        </div>
        <ConfirmationModal
          isOpen={discard !== null}
          onClose={() => setDiscard(null)}
          onConfirm={discardConfirmed}
          title={t("board.arrange.discard.title")}
          message={
            discard?.kind === "template"
              ? t("widgets:board.settings.discardForTemplate")
              : t("board.arrange.discard.message")
          }
          confirmText={
            discard?.kind === "template" ? t("widgets:board.templates.apply") : t("board.arrange.discard.confirm")
          }
          cancelText={t("board.arrange.discard.keep")}
          variant="warning"
        />
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
          onImported={(widgetDraft) => {
            setImporting(false);
            gallery.open(widgetDraft, null, "mine");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
