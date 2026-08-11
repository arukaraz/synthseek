"use client";

import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ImportReviewModal } from "@features/import-review";
import { useImportReview } from "@hooks/api";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { REVIEW_QUEUE_HASH } from "./constants";
import { reviewQueueBadge, reviewQueueTrigger } from "./styles";

function hashRequestsReview(): boolean {
  return window.location.hash.slice(1) === REVIEW_QUEUE_HASH;
}

export function ReviewQueueButton() {
  const { t } = useTranslation("requests");
  const { isAdmin } = useAuthContext();
  const review = useImportReview({ enabled: isAdmin });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const openFromHash = () => {
      if (hashRequestsReview()) setIsOpen(true);
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [isAdmin]);

  if (!isAdmin) return null;

  const heldCount = review.data?.totalCount ?? 0;
  const pendingCount = review.data?.pendingCount ?? 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && hashRequestsReview()) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        className={reviewQueueTrigger()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={t("review.trigger")}
        aria-label={
          pendingCount > 0
            ? t("review.triggerAria", { count: pendingCount })
            : heldCount > 0
              ? t("review.triggerAriaHeld", { count: heldCount })
              : t("review.trigger")
        }
        onClick={() => setIsOpen(true)}
      >
        <ClipboardCheck className="size-4" />
        {pendingCount > 0 ? <span className={reviewQueueBadge()}>{pendingCount}</span> : null}
      </motion.button>

      <ImportReviewModal open={isOpen} onOpenChange={handleOpenChange} />
    </>
  );
}
