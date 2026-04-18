"use client";

import useAlbum from "@hooks/api/useAlbum";
import { useDebounce } from "@hooks/ui/useDebounce";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Toolbar } from "../components/Toolbar/Toolbar";
import { requestsView } from "../components/styles";
import { SortField, SortConfig, StatusFilter, ViewMode } from "../types";
import { CompactView } from "./CompactView";
import { ListView } from "./ListView";

interface RequestsViewProps {
  viewMode: ViewMode;
}

export function RequestsView({ viewMode }: RequestsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { albums, retryAllFailed, deleteAll, isRetryingAll, isDeletingAll } = useAlbum();

  const sortParam = searchParams.get("sort");
  const validSortValues = Object.values(SortField);
  const initialSort = validSortValues.includes(sortParam as SortField) ? (sortParam as SortField) : SortField.RECENT;

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortConfig>({ field: initialSort, direction: "desc" });
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, { delay: 300 });

  const hasItems = (albums?.length ?? 0) > 0;

  const handleViewModeChange = (newViewMode: ViewMode) => {
    router.push(`/requests?view=${newViewMode}`);
  };

  const handleRetryAllFailed = () => {
    retryAllFailed();
  };

  const handleDeleteAll = () => {
    deleteAll();
  };

  return (
    <div className={requestsView()}>
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRetryAllFailed={handleRetryAllFailed}
        onDeleteAll={handleDeleteAll}
        hasItems={hasItems}
        isRetrying={isRetryingAll}
        isDeleting={isDeletingAll}
      />

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {viewMode === "compact" ? (
              <CompactView statusFilter={statusFilter} sort={sort} searchQuery={debouncedSearchQuery} />
            ) : (
              <ListView searchQuery={debouncedSearchQuery} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
