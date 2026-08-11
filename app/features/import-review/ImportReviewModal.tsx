"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { EmptyState } from "@components/ui/EmptyState";
import { Spinner } from "@components/ui/Spinner";
import { useImportReview } from "@hooks/api";

import { ReviewFooter } from "./components/ReviewFooter";
import { ReviewItemRow } from "./components/ReviewItemRow";
import { errorText, itemList, modalBody, modalContent, modalHeader } from "./styles";
import type { ImportReviewModalProps } from "./types";

export function ImportReviewModal({ open, onOpenChange }: ImportReviewModalProps) {
  const { t } = useTranslation("requests");
  const review = useImportReview();

  const items = review.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={modalContent()}>
        <div className={modalBody()}>
          <div className={modalHeader()}>
            <DialogTitle>{t("review.modal.title")}</DialogTitle>
            <DialogDescription>{t("review.modal.description")}</DialogDescription>
          </div>

          {review.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner size="md" />
            </div>
          ) : review.isError ? (
            <span className={errorText()}>{t("review.loadError")}</span>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title={t("review.empty.title")}
              description={t("review.empty.description")}
            />
          ) : (
            <ul className={itemList()}>
              {items.map((item) => (
                <ReviewItemRow key={item.id} item={item} />
              ))}
            </ul>
          )}

          <ReviewFooter totalCount={review.data?.totalCount ?? 0} totalBytes={review.data?.totalBytes ?? 0} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
