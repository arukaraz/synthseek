"use client";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { ImportFromProvidersModal } from "@features/import-from-providers";
import { useTrackRequests, useRetryAllFailed } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { primaryGradientButton } from "@theme/utilities/styles";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toolbarContainer } from "../styles";
import { REQUESTS_URL_PARAMS } from "../../types";
import { FilterSortMenu } from "./FilterSortMenu";
import { SearchInput } from "./SearchInput/SearchInput";
import { ViewToggle } from "./ViewToggle";

export function Toolbar() {
  const { data: items } = useTrackRequests();
  const retryAllFailed = useRetryAllFailed();
  const [urlSearchQuery, setUrlSearchQuery] = useUrlParam("q", REQUESTS_URL_PARAMS.q);

  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  const debouncedSearchInput = useDebounce(searchInput, { delay: 300 });

  useEffect(() => {
    if (debouncedSearchInput !== urlSearchQuery) {
      setUrlSearchQuery(debouncedSearchInput || null);
    }
  }, [debouncedSearchInput, urlSearchQuery, setUrlSearchQuery]);

  const [confirmRetryOpen, setConfirmRetryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const hasItems = (items?.length ?? 0) > 0;

  const handleRetryConfirm = () => {
    retryAllFailed.mutate();
    setConfirmRetryOpen(false);
  };

  return (
    <>
      <div className={toolbarContainer()}>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          <ViewToggle />

          <div className={cn("bg-fg/10 h-4 w-px", isSearchOpen && "hidden sm:block")} />

          <div className={cn("flex items-center gap-1.5 sm:gap-2", isSearchOpen && "hidden sm:flex")}>
            <FilterSortMenu />
          </div>

          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            isOpen={isSearchOpen}
            onOpenChange={setIsSearchOpen}
          />
        </div>

        <div className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", isSearchOpen && "hidden sm:flex")}>
          {hasItems && (
            <Button
              onClick={() => setConfirmRetryOpen(true)}
              variant="outline"
              size="sm"
              className={cn(
                "border-primary-500/30 bg-primary-500/10 text-primary-300",
                "hover:border-primary-500/50 hover:bg-primary-500/20 hover:text-primary-200"
              )}
              aria-label="Retry all failed requests"
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Retry All Failed
            </Button>
          )}
          <motion.button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className={cn(
              primaryGradientButton({ size: "sm", glow: "primary", hover: "lighten" }),
              "size-9! justify-center! p-0!"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Import from providers"
            aria-label="Import from providers"
          >
            <Plus className="size-4" />
          </motion.button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmRetryOpen}
        onClose={() => setConfirmRetryOpen(false)}
        onConfirm={handleRetryConfirm}
        title="Retry All Failed"
        message="This will retry all failed and partially completed downloads. Continue?"
        variant="warning"
        confirmText={retryAllFailed.isPending ? "Retrying..." : "Retry All"}
      />

      <ImportFromProvidersModal open={isImportOpen} onOpenChange={setIsImportOpen} />
    </>
  );
}
