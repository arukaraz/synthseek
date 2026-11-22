"use client";

import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { clearHashTargetGlow, triggerHashTargetGlow } from "@utils/hash-target-glow";

import { reviewTrackAnchor } from "./helpers";
import { ReviewContent } from "./ReviewContent";
import { modalBody, modalContent, modalHeader } from "./styles";
import type { ImportReviewModalProps } from "./types";

export function ImportReviewModal({ open, onOpenChange, focusTrackId }: ImportReviewModalProps) {
  const { t } = useTranslation("requests");

  const handleOpenAutoFocus = (event: Event) => {
    if (focusTrackId === null) return;
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus({ preventScroll: true });
    triggerHashTargetGlow(reviewTrackAnchor(focusTrackId));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) clearHashTargetGlow();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={modalContent()} onOpenAutoFocus={handleOpenAutoFocus}>
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
