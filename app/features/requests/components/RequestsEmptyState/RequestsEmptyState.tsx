"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Inbox, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RequestsEmptyStateProps } from "./types";

export function RequestsEmptyState({ searchQuery }: RequestsEmptyStateProps) {
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

  return (
    <EmptyState
      icon={Inbox}
      title={t("emptyState.noRequestsTitle")}
      description={t("emptyState.noRequestsDescription")}
    />
  );
}
