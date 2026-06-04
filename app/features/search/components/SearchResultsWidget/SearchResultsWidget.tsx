"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { ContentType, type FilterType } from "@api/__generated__/types";
import { useSearchContent as useSearch } from "@hooks/api/queries/useSearchContent";
import { fadeIn } from "@utils/animations";
import { titleCase } from "@utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { MAX_RESULTS_DISPLAY } from "../../constants";
import { useContentRequestFlow } from "../ContentRequestFlow/ContentRequestFlow";
import { AllResults } from "../Results/AllResults";
import { FilterTabs } from "../Results/FilterTabs";
import { Results } from "../Results/Results";
import { SkeletonGrid } from "../Results/SkeletonGrid";
import { SkeletonSection } from "../Results/SkeletonSection";
import { filterTabsContainer } from "../styles";
import { getActiveFilter, getAvailableTypes, getFilteredResults, getFlatResults } from "./helpers";

export function SearchResultsWidget() {
  const { t } = useTranslation("search");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openForResult } = useContentRequestFlow();
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);

  const query = searchParams.get("q") ?? "";
  const filterParam = searchParams.get("filter");
  const activeFilter: FilterType = getActiveFilter(filterParam, "all");

  const { data, isLoading } = useSearch(query, [
    ContentType.enum.album,
    ContentType.enum.track,
    ContentType.enum.artist,
    ContentType.enum.playlist,
  ]);

  const searchResponse = data?.results;
  const flatResults = useMemo(() => getFlatResults(searchResponse), [searchResponse]);
  const availableTypes = useMemo(() => getAvailableTypes(searchResponse), [searchResponse]);
  const filteredResults = useMemo(
    () => getFilteredResults(searchResponse, activeFilter, flatResults),
    [searchResponse, activeFilter, flatResults]
  );

  const handleContentClick = (resultId: string, type: ContentType) => {
    const result = flatResults.find((item) => item.id === resultId && item.type === type);
    if (result) openForResult(result);
  };

  const handleFilterChange = (filter: FilterType) => {
    setIsFilterTransitioning(true);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (filter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", filter);
      }
      router.replace(`/search?${params.toString()}`, { scroll: false });
    });

    setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 300);
  };

  if (!query) {
    return (
      <EmptyState
        icon={Search}
        title={t("results.emptyState.start.title")}
        description={t("results.emptyState.start.description")}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-fg/10 flex-shrink-0 border-b">
          <div className="p-4 pb-3 sm:p-6 sm:pb-4">
            <div className="bg-fg/10 mb-2 h-6 w-48 animate-pulse rounded" />
            <div className="bg-fg/5 h-4 w-64 animate-pulse rounded" />
          </div>

          <div className={filterTabsContainer()}>
            {[92, 104, 85, 110, 96].map((width, i) => (
              <div key={i} className="bg-fg/5 h-9 animate-pulse rounded-full" style={{ width: `${width}px` }} />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              {[0, 1, 2, 3].map((section) => (
                <SkeletonSection key={section} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (flatResults.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title={t("results.emptyState.noResults.title")}
        description={t("results.emptyState.noResults.description")}
      />
    );
  }

  return (
    <div className="flex h-full flex-col" data-cy="search-results">
      <div className="border-fg/10 flex-shrink-0 border-b">
        <div className="p-4 pb-3 sm:p-6 sm:pb-4">
          <h3 className="text-fg mb-1 text-base font-semibold sm:text-lg">{t("results.heading")}</h3>
          <p className="text-fg/60 text-sm" data-cy="result-count">
            {t("results.count", { count: flatResults.length, query })}
          </p>
        </div>

        {availableTypes.size > 1 && (
          <div className="pb-4">
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              availableTypes={availableTypes}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {isFilterTransitioning ? (
            <motion.div
              key="skeleton"
              className="p-4 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeFilter === "all" ? (
                <div className="space-y-6 sm:space-y-8">
                  {[0, 1, 2, 3].map((section) => (
                    <SkeletonSection key={section} />
                  ))}
                </div>
              ) : (
                <SkeletonGrid count={24} />
              )}
            </motion.div>
          ) : (
            <motion.div key={activeFilter} className="p-4 sm:p-6" variants={fadeIn} initial="hidden" animate="visible">
              {activeFilter === "all" && searchResponse ? (
                <div className="space-y-6 sm:space-y-8">
                  {Object.entries(searchResponse).map(([sectionKey, sectionResults]) => (
                    <AllResults
                      key={sectionKey}
                      title={titleCase(sectionKey)}
                      results={sectionResults.items}
                      totalCount={sectionResults.items.length}
                      maxDisplay={MAX_RESULTS_DISPLAY}
                      onSeeAll={() => handleFilterChange(sectionKey as ContentType)}
                      filterType={sectionKey as ContentType}
                      onResultClick={handleContentClick}
                    />
                  ))}
                </div>
              ) : (
                <Results results={filteredResults} onResultClick={handleContentClick} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
