"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Inbox, Search } from "lucide-react";

interface RequestsEmptyStateProps {
  searchQuery?: string;
}

export function RequestsEmptyState({ searchQuery }: RequestsEmptyStateProps) {
  const hasSearch = !!searchQuery && searchQuery.trim().length > 0;

  if (hasSearch) {
    return <EmptyState icon={Search} title="No Results" description={`No requests match "${searchQuery}"`} />;
  }

  return <EmptyState icon={Inbox} title="No Requests" description="Your download requests will appear here." />;
}
