"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { ModalActionBar } from "@components/ui/ModalActionBar";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useWidgetCatalog } from "@hooks/api/queries/widgets/useWidgetCatalog";
import { useWidgetGrammar } from "@hooks/api/queries/widgets/useWidgetGrammar";
import { useWidgetHousehold } from "@hooks/api/queries/widgets/useWidgetHousehold";
import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";
import { useCountry } from "@modules/providers/CountryProvider";

import { useCustomizationDraft } from "../../hooks/useCustomizationDraft";
import { useGalleryWorkshop } from "../../hooks/useGalleryWorkshop";
import { DEFAULT_GALLERY_FILTERS } from "../WidgetGallery/constants";
import { ImportWidgetDialog } from "../WidgetGallery/ImportWidgetDialog";
import { galleryDialog, visuallyHidden } from "../WidgetGallery/styles";
import type { GalleryFilters, GalleryLeave } from "../WidgetGallery/types";
import { WidgetWorkshop } from "../WidgetWorkshop/WidgetWorkshop";
import { dialogHeader, dialogPanel, dialogTitleRow } from "./styles";
import type { WidgetsDialogProps } from "./types";
import { WidgetsSection } from "./WidgetsSection";

export function WidgetsDialog({ lists, opening, custom, onSave, onClose }: WidgetsDialogProps) {
  const { t } = useTranslation(["discover", "widgets"]);
  const [filters, setFilters] = useState<GalleryFilters>(DEFAULT_GALLERY_FILTERS);
  const [discarding, setDiscarding] = useState(false);
  const [leaving, setLeaving] = useState<GalleryLeave | null>(null);
  const [importing, setImporting] = useState(false);
  const draft = useCustomizationDraft({ lists, custom });
  const gallery = useGalleryWorkshop(opening.target);
  const catalog = useWidgetCatalog();
  const grammar = useWidgetGrammar();
  const presets = useWidgetPresets();
  const household = useWidgetHousehold();
  const { country } = useCountry();
  const openerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const workshopOpen = gallery.opening !== null;

  const closeOrConfirm = () => {
    if (draft.dirty) setDiscarding(true);
    else onClose();
  };
  const requestClose = () => {
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
  const save = () => onSave({ lists: draft.rearranged ? draft.draft : null, appearance: null });

  const Title = workshopOpen ? "h2" : DialogTitle;
  const Description = workshopOpen ? "p" : DialogDescription;
  const description = gallery.mode === "mine" ? t("widgets:mine.subtitle") : t("board.gallery.subtitle");

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
        <div hidden={workshopOpen} className={dialogPanel()}>
          <div ref={headerRef} tabIndex={-1} className={dialogHeader()}>
            <div className={dialogTitleRow()}>
              <Title>{t("widgets:board.widgetsDialog.title")}</Title>
              <InfoTooltip description={description} side="bottom" align="start" />
              <Description className={visuallyHidden()}>{description}</Description>
            </div>
          </div>
          <WidgetsSection
            draft={draft}
            gallery={gallery}
            filters={filters}
            onFiltersChange={setFilters}
            onImport={() => setImporting(true)}
          />
          <ModalActionBar
            cancel={{ label: t("board.arrange.cancel"), onClick: requestClose }}
            save={{ label: t("board.arrange.save"), onClick: save, disabled: !draft.dirty }}
          />
        </div>
        <ConfirmationModal
          isOpen={discarding}
          onClose={() => setDiscarding(false)}
          onConfirm={() => {
            setDiscarding(false);
            onClose();
          }}
          title={t("board.arrange.discard.title")}
          message={t("board.arrange.discard.message")}
          confirmText={t("board.arrange.discard.confirm")}
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
