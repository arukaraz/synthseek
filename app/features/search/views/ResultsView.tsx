"use client";

import { EmptyState } from "@components/ui/EmptyState";
import ConfigRequestModal from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { ContentType } from "@api/__generated__/types";
import { fadeIn } from "@utils/animations";
import { titleCase } from "@utils/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useMemo, useState } from "react";
import type { MusicItem } from "@api/__generated__/types";
import useSearch from "@hooks/api/queries/useSearchContent";
import { ContentBrowserModal } from "../components/ContentBrowserModal/ContentBrowserModal";
import type { RequestContext } from "../components/ContentBrowserModal/types";
import { AllResults } from "../components/Results/AllResults";
import { FilterTabs } from "../components/Results/FilterTabs";
import { Results } from "../components/Results/Results";
import { SkeletonGrid, SkeletonSection } from "../components/Results/Skeleton";
import { filterTabsContainer } from "../components/styles";

type FilterType = ContentType | "all";

const VALID_FILTERS = ["all", ...ContentType.options] as const;

interface ResultsViewProps {
  query: string;
  initialFilter?: string;
}

const MAX_RESULTS_DISPLAY = 12;

export default function ResultsView({ query, initialFilter = "all" }: ResultsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading } = useSearch(query, [
    ContentType.enum.album,
    ContentType.enum.track,
    ContentType.enum.artist,
    ContentType.enum.playlist,
  ]);
  const [selectedResult, setSelectedResult] = useState<MusicItem | null>(null);
  const [showContentBrowserModal, setShowContentBrowserModal] = useState(false);
  const [showConfigRequestModal, setShowConfigRequestModal] = useState(false);
  const [selectedContentToRequest, setSelectedContentToRequest] = useState<MusicItem | null>(null);
  const [parentAlbumFromContext, setParentAlbumFromContext] = useState<MusicItem | null>(null);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);

  const filterParam = searchParams.get("filter") ?? initialFilter;
  const activeFilter: FilterType = VALID_FILTERS.includes(filterParam as (typeof VALID_FILTERS)[number])
    ? (filterParam as FilterType)
    : "all";

  const searchResponse = data?.results;

  const results = useMemo(
    () => [
      ...(searchResponse?.tracks?.items || []),
      ...(searchResponse?.albums?.items || []),
      ...(searchResponse?.artists?.items || []),
      ...(searchResponse?.playlists?.items || []),
    ],
    [searchResponse]
  );

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    if (searchResponse?.tracks?.items.length) types.add(ContentType.enum.track);
    if (searchResponse?.albums?.items.length) types.add(ContentType.enum.album);
    if (searchResponse?.artists?.items.length) types.add(ContentType.enum.artist);
    if (searchResponse?.playlists?.items.length) types.add(ContentType.enum.playlist);
    return types;
  }, [searchResponse]);

  const handleContentClick = async (resultId: string, type: ContentType) => {
    const result = results.find((item) => item.id === resultId && item.type === type) || null;

    if (!result) return;

    setSelectedResult(result);
    if (type === ContentType.enum.track) {
      setSelectedContentToRequest(result);
      setShowConfigRequestModal(true);
    } else {
      setShowContentBrowserModal(true);
    }
  };

  const handleCloseContentBrowserModal = () => {
    setSelectedResult(null);
    setShowContentBrowserModal(false);
  };

  const handleRequestContentClick = (requestedItem: MusicItem, context?: RequestContext) => {
    if (
      requestedItem.type === ContentType.enum.track ||
      requestedItem.type === ContentType.enum.album ||
      requestedItem.type === ContentType.enum.playlist
    ) {
      setSelectedContentToRequest(requestedItem);
      setParentAlbumFromContext(context?.parentAlbum ?? null);
      setShowConfigRequestModal(true);
      setShowContentBrowserModal(false);
    }
  };

  const handleConfigModalClose = () => {
    setShowConfigRequestModal(false);
    setSelectedContentToRequest(null);
    setParentAlbumFromContext(null);
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

  const filteredResults = useMemo(() => {
    switch (activeFilter) {
      case ContentType.enum.track:
        return searchResponse?.tracks?.items || [];
      case ContentType.enum.album:
        return searchResponse?.albums?.items || [];
      case ContentType.enum.artist:
        return searchResponse?.artists?.items || [];
      case ContentType.enum.playlist:
        return searchResponse?.playlists?.items || [];
      default:
        return results;
    }
  }, [results, activeFilter, searchResponse]);

  if (!query) {
    return (
      <>
        <EmptyState
          icon={Search}
          title="Start Searching"
          description="Use the search bar above to find tracks, albums, or artists"
        />
      </>
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

        <div className="custom-scrollbar flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              {["Playlists", "Artists", "Albums", "Songs"].map((section) => (
                <SkeletonSection key={section} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyState icon={Inbox} title="No Results Found" description="Try searching for something else" />;
  }

  return (
    <div className="flex h-full flex-col" data-cy="search-results">
      <div className="border-fg/10 flex-shrink-0 border-b">
        <div className="p-4 pb-3 sm:p-6 sm:pb-4">
          <h3 className="text-fg mb-1 text-base font-semibold sm:text-lg">Search Results</h3>
          <p className="text-fg/60 text-sm" data-cy="result-count">
            Found {results.length} result{results.length === 1 ? "" : "s"} for &quot;{query}&quot;
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

      <div className="custom-scrollbar flex-1 overflow-auto">
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
                  {["Playlists", "Artists", "Albums", "Songs"].map((section) => (
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

      {selectedResult && selectedResult.type !== ContentType.enum.track && (
        <ContentBrowserModal
          type={selectedResult.type}
          data={selectedResult}
          onClose={handleCloseContentBrowserModal}
          open={showContentBrowserModal}
          onRequestClick={handleRequestContentClick}
        />
      )}

      {selectedContentToRequest && (
        <ConfigRequestModal
          isOpen={showConfigRequestModal}
          item={selectedContentToRequest}
          itemType={selectedContentToRequest.type}
          onClose={handleConfigModalClose}
          onSuccess={() => {}}
          parentAlbum={parentAlbumFromContext}
        />
      )}
    </div>
  );
}
