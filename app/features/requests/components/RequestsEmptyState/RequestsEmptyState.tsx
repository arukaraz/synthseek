"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Download, Filter, Inbox, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RequestsEmptyStateProps } from "./types";

export function RequestsEmptyState({
  searchQuery,
  emptySourceLabel = null,
  filtered = false,
}: RequestsEmptyStateProps) {
  const { t } = useTranslation("requests");
  const hasSearch = !!searchQuery && searchQuery.trim().length > 0;

  if (hasSearch) {
    return (
      <EmptyState
        icon={Search}
        title={t("emptyState.noResultsTitle")}
        description={t("emptyState.noResultsDescription", { query: searchQuery })}
      />
    );
  }

  if (emptySourceLabel !== null) {
    return (
      <EmptyState
        icon={Download}
        title={t("emptyState.noSourceTitle", { source: emptySourceLabel })}
        description={t("emptyState.noSourceDescription")}
      />
    );
  }

  if (filtered) {
    return (
      <EmptyState
        icon={Filter}
        title={t("emptyState.noFilterTitle")}
        description={t("emptyState.noFilterDescription")}
      />
    );
  }

  return (
    <EmptyState
      icon={Inbox}
      title={t("emptyState.noRequestsTitle")}
      description={t("emptyState.noRequestsDescription")}
    />
  );
}
