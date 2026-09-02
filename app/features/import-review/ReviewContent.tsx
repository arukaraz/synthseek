"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@components/ui/EmptyState";
import { Spinner } from "@components/ui/Spinner";
import { useImportReview } from "@hooks/api";

import { ReviewFooter } from "./components/ReviewFooter";
import { ReviewItemRow } from "./components/ReviewItemRow";
import { errorText, itemList } from "./styles";

export function ReviewContent() {
  const { t } = useTranslation("requests");
  const review = useImportReview();

  const items = review.data?.items ?? [];

  return (
    <>
      {review.isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      ) : review.isError ? (
        <span className={errorText()}>{t("review.loadError")}</span>
      ) : items.length === 0 ? (
        <EmptyState icon={ShieldCheck} title={t("review.empty.title")} description={t("review.empty.description")} />
      ) : (
        <ul className={itemList()}>
          {items.map((item) => (
            <ReviewItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <ReviewFooter totalCount={review.data?.totalCount ?? 0} totalBytes={review.data?.totalBytes ?? 0} />
    </>
  );
}
