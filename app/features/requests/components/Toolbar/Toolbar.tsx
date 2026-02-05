"use client";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useEffect, useState } from "react";
import { SortConfig, SortDirection, SortField, StatusFilter, ViewMode } from "../../types";
import { toolbarContainer } from "../styles";
import { ActionsDropdown } from "./ActionsDropdown";
import { SearchInput } from "./SearchInput/SearchInput";
import { SortDirectionButton } from "./SortDirectionButton";
import { SortDropdown } from "./SortDropdown";
import { StatusFilterDropdown } from "./StatusFilterDropdown";
import { ViewToggle } from "./ViewToggle";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  sort: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRetryAllFailed: () => void;
  onDeleteAll: () => void;
  hasItems: boolean;
  isRetrying?: boolean;
  isDeleting?: boolean;
}

export function Toolbar({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  sort,
  onSortChange,
  searchQuery,
  onSearchChange,
  onRetryAllFailed,
  onDeleteAll,
  hasItems,
  isRetrying,
  isDeleting,
}: ToolbarProps) {
  const showFiltersAndActions = viewMode === "compact";
  const [confirmModal, setConfirmModal] = useState<"retry" | "delete" | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  const showRetryFailed = statusFilter === "all" || statusFilter === "failed";

  const handleSortFieldChange = (field: SortField) => {
    onSortChange({ ...sort, field });
  };

  const handleSortDirectionToggle = () => {
    const newDirection: SortDirection = sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ ...sort, direction: newDirection });
  };

  const handleRetryConfirm = () => {
    onRetryAllFailed();
    setConfirmModal(null);
  };

  const handleDeleteConfirm = () => {
    onDeleteAll();
    setConfirmModal(null);
  };

  return (
    <>
      <div className={toolbarContainer()}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />

          {showFiltersAndActions && (
            <>
              <div className="bg-fg/10 h-4 w-px" />

              {isMobile && isSearchOpen ? (
                <SearchInput
                  value={searchQuery}
                  onChange={onSearchChange}
                  isOpen={isSearchOpen}
                  onOpenChange={setIsSearchOpen}
                  isMobile={true}
                />
              ) : (
                <>
                  <StatusFilterDropdown value={statusFilter} onChange={onStatusFilterChange} />
                  <SortDropdown value={sort.field} onChange={handleSortFieldChange} />
                  <SortDirectionButton direction={sort.direction} onToggle={handleSortDirectionToggle} />
                </>
              )}
            </>
          )}

          {!(showFiltersAndActions && isMobile && isSearchOpen) && (
            <>
              {!showFiltersAndActions && <div className="bg-fg/10 h-4 w-px" />}
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                isOpen={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                isMobile={isMobile}
              />
            </>
          )}
        </div>

        {showFiltersAndActions && hasItems && !(isMobile && isSearchOpen) && (
          <div className="shrink-0">
            <ActionsDropdown
              showRetryFailed={showRetryFailed}
              onRetryAllFailed={() => setConfirmModal("retry")}
              onDeleteAll={() => setConfirmModal("delete")}
            />
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal === "retry"}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleRetryConfirm}
        title="Retry All Failed"
        message="This will retry all failed and partially completed downloads. Continue?"
        variant="warning"
        confirmText={isRetrying ? "Retrying..." : "Retry All"}
      />
      <ConfirmationModal
        isOpen={confirmModal === "delete"}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete All Requests"
        message="This will permanently delete all album requests. This action cannot be undone."
        variant="danger"
        confirmText={isDeleting ? "Deleting..." : "Delete All"}
      />
    </>
  );
}
