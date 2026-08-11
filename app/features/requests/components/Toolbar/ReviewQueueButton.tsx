"use client";

import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ImportReviewModal } from "@features/import-review";
import { useImportReview } from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { reviewQueueBadge, reviewQueueTrigger } from "./styles";

export function ReviewQueueButton() {
  const { t } = useTranslation("requests");
  const { isAdmin } = useAuthContext();
  const review = useImportReview({ enabled: isAdmin });
  const [isOpen, setIsOpen] = useState(false);

  const heldCount = review.data?.totalCount ?? 0;
  const pendingCount = review.data?.pendingCount ?? 0;
  const hasQueue = heldCount > 0;

  if (!isAdmin) return null;
  if (!hasQueue && !isOpen) return null;

  return (
    <>
      {hasQueue ? (
        <motion.button
          type="button"
          className={reviewQueueTrigger()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={t("review.trigger")}
          aria-label={
            pendingCount > 0
              ? t("review.triggerAria", { count: pendingCount })
              : t("review.triggerAriaHeld", { count: heldCount })
          }
          onClick={() => setIsOpen(true)}
        >
          <ClipboardCheck className="size-4" />
          {pendingCount > 0 ? <span className={reviewQueueBadge()}>{pendingCount}</span> : null}
        </motion.button>
      ) : null}

      <ImportReviewModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
