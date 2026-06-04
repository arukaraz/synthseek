"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useJspfImportFlow } from "./hooks/useJspfImportFlow";
import { PreviewStep } from "./steps/PreviewStep";
import { SourceStep } from "./steps/SourceStep";
import { modalBody, modalContent, modalHeader } from "./styles";
import type { JspfImportModalProps } from "./types";

export function JspfImportModal({ open, onOpenChange }: JspfImportModalProps) {
  const { t } = useTranslation("library");
  const flow = useJspfImportFlow(onOpenChange);

  useEffect(() => {
    if (!open) flow.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalContent()}>
        <div className={modalBody()}>
          <div className={modalHeader()}>
            <DialogTitle>{t("jspfImport.modal.title")}</DialogTitle>
            <DialogDescription>{t("jspfImport.modal.description")}</DialogDescription>
          </div>
          {flow.step === "source" ? (
            <SourceStep onLoaded={flow.loadPayload} />
          ) : (
            <PreviewStep
              jobId={flow.jobId}
              preview={flow.preview}
              isPreviewing={flow.isPreviewing}
              isCommitting={flow.isCommitting}
              errorMessage={flow.errorMessage}
              selected={flow.selected}
              onToggleTrack={flow.toggleTrack}
              onConfirm={flow.confirm}
              onBack={flow.back}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
