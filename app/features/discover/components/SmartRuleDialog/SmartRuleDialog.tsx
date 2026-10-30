"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AlertTriangle } from "lucide-react";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useSmartPlaylistRule } from "@hooks/api/queries/widgets/useSmartPlaylistRule";
import { useWidgetCatalog } from "@hooks/api/queries/widgets/useWidgetCatalog";
import { useWidgetGrammar } from "@hooks/api/queries/widgets/useWidgetGrammar";
import { useWidgetHousehold } from "@hooks/api/queries/widgets/useWidgetHousehold";
import { useWidgetPresets } from "@hooks/api/queries/widgets/useWidgetPresets";
import { useCountry } from "@modules/providers/CountryProvider";

import { visuallyHidden } from "../CustomWidget/styles";
import { galleryDialog } from "../WidgetGallery/styles";
import { WidgetWorkshop } from "../WidgetWorkshop/WidgetWorkshop";
import { ruleDraftOf } from "./helpers";
import type { SmartRuleDialogProps } from "./types";

export function SmartRuleDialog({ playlistId, open, onOpenChange }: SmartRuleDialogProps) {
  const { t } = useTranslation("widgets");
  const { country } = useCountry();
  const rule = useSmartPlaylistRule(playlistId, open);
  const catalog = useWidgetCatalog();
  const grammar = useWidgetGrammar();
  const presets = useWidgetPresets();
  const household = useWidgetHousehold();
  const failed = rule.isError || catalog.isError || grammar.isError || presets.isError;
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    setDirty(false);
    setConfirming(false);
    onOpenChange(false);
  };
  const requestClose = () => (dirty ? setConfirming(true) : close());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      <DialogContent animation="panel" className={galleryDialog({ workshop: true })}>
        {rule.data && catalog.data && grammar.data && presets.data ? (
          <WidgetWorkshop
            opening={{ draft: ruleDraftOf(rule.data, playlistId), widgetId: null, purpose: "rule" }}
            context={{
              catalog: catalog.data,
              grammar: grammar.data,
              presets: presets.data,
              country,
              people: household.data ?? [],
            }}
            onLeave={requestClose}
            onDirtyChange={setDirty}
            onSaved={(name) => {
              toast.success(t("playlist.saved", { name }));
              close();
            }}
          />
        ) : (
          <>
            <DialogTitle className={visuallyHidden()}>{t("playlist.title")}</DialogTitle>
            <DialogDescription className={visuallyHidden()}>{t("playlist.ruleHelp")}</DialogDescription>
            {failed ? (
              <EmptyState
                icon={AlertTriangle}
                title={t("playlist.loadError.title")}
                description={t("playlist.loadError.description")}
              />
            ) : (
              <SectionLoading />
            )}
          </>
        )}
        <ConfirmationModal
          isOpen={confirming}
          onClose={() => setConfirming(false)}
          onConfirm={close}
          title={t("workshop.discard.title")}
          message={t("workshop.discard.message")}
          confirmText={t("workshop.discard.confirm")}
          cancelText={t("workshop.discard.keep")}
          variant="warning"
        />
      </DialogContent>
    </Dialog>
  );
}
