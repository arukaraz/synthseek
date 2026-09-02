"use client";

import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";

import { ReviewContent } from "./ReviewContent";
import { modalBody, modalContent, modalHeader } from "./styles";
import type { ImportReviewModalProps } from "./types";

export function ImportReviewModal({ open, onOpenChange }: ImportReviewModalProps) {
  const { t } = useTranslation("requests");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalContent()}>
        <div className={modalBody()}>
          <div className={modalHeader()}>
            <DialogTitle>{t("review.modal.title")}</DialogTitle>
            <DialogDescription>{t("review.modal.description")}</DialogDescription>
          </div>

          <ReviewContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
