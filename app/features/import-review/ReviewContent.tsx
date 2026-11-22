"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@components/ui/EmptyState";
import { Spinner } from "@components/ui/Spinner";
import { useImportReview } from "@hooks/api";
import { useReviewApprovalsInFlight } from "@hooks/api/subscriptions";

import { ReviewFooter } from "./components/ReviewFooter";
import { ReviewPlayerBar } from "./components/ReviewPlayerBar";
import { ReviewReasonChips } from "./components/ReviewReasonChips";
import { ReviewRequestGroup } from "./components/ReviewRequestGroup";
import { countReasons, groupReviewItems } from "./helpers";
import { errorText, itemList } from "./styles";
import type { ReasonFilter } from "./types";

export function ReviewContent() {
  const { t } = useTranslation("requests");
  const review = useImportReview();
  const inFlight = useReviewApprovalsInFlight();
  const [filter, setFilter] = useState<ReasonFilter>("all");
  const [listeningId, setListeningId] = useState<string | null>(null);

  const held = review.data?.items ?? [];
  const items = held.filter((item) => !inFlight.has(item.id));
  const hidden = held.filter((item) => inFlight.has(item.id));
  const hiddenBytes = hidden.reduce((total, item) => total + item.sizeBytes, 0);
  const counts = countReasons(items);
  const activeFilter = filter !== "all" && counts.some((entry) => entry.reason === filter) ? filter : "all";
  const groups = groupReviewItems(items, activeFilter);
  const listening = items.find((item) => item.id === listeningId) ?? null;

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
        <>
          {counts.length > 1 ? (
            <ReviewReasonChips counts={counts} total={items.length} active={activeFilter} onChange={setFilter} />
          ) : null}
          <ul className={itemList()} data-glow-scroller="">
            {groups.map((group) => (
              <ReviewRequestGroup
                key={`${group.request.contentType}:${group.request.id}`}
                group={group}
                onListen={setListeningId}
              />
            ))}
          </ul>
        </>
      )}

      {listening ? <ReviewPlayerBar item={listening} /> : null}

      <ReviewFooter
        totalCount={(review.data?.totalCount ?? 0) - hidden.length}
        totalBytes={(review.data?.totalBytes ?? 0) - hiddenBytes}
      />
    </>
  );
}
