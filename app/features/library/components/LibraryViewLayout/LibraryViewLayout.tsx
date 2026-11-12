"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Spinner } from "@components/ui/Spinner";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { countActiveFilters, toggleFilterValue } from "../../helpers";
import { useShelfCollapse } from "../../hooks/useShelfCollapse";
import { mainColumn, resultsOverlay, resultsScroll, resultsShell, sidebarColumn, stateWrap } from "../../styles";
import { LibraryInfiniteGrid } from "../LibraryCard";
import { LibraryFilterSheet } from "../LibraryFilterSheet/LibraryFilterSheet";
import { LibraryFilterSidebar } from "../LibraryFilterSidebar/LibraryFilterSidebar";
import { LibraryShelfHeader } from "../LibraryShelf";
import type { LibraryFilterSidebarProps } from "../LibraryFilterSidebar/types";
import { LibraryLoadMore } from "../LibraryLoadMore/LibraryLoadMore";
import { LibraryTable } from "../LibraryTable/LibraryTable";
import { LibraryLetterIndex } from "./LibraryLetterIndex";
import type { LibraryViewLayoutProps } from "./types";

export function LibraryViewLayout<TItem>({
  controller,
  items,
  total,
  facets,
  isLoading,
  isError,
  isRefreshing = false,
  content,
  shell,
}: LibraryViewLayoutProps<TItem>) {
  const { t } = useTranslation("library");
  const { config } = controller;
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const activeFilterCount = countActiveFilters(controller.filters);
  const collapsed = useShelfCollapse(scrollRoot, shell.phone);

  const sidebarProps: LibraryFilterSidebarProps = {
    config,
    facets,
    filters: controller.filters,
    facetSearch: controller.facetSearch,
    onToggleValue: (key, value) => {
      controller.setFilterValues(key, toggleFilterValue(controller.filters[key] ?? [], value));
    },
    onOrphanChange: controller.setOrphan,
    onFacetSearch: controller.setFacetSearch,
    onClear: controller.clearFilters,
    hasActiveFilters: activeFilterCount > 0 || Object.values(controller.facetSearch).some(Boolean),
    allMembers: shell.admin && config.view === "playlists",
    isRefreshing,
  };

  const letterIndex =
    content.layout === "grid" && content.letterIndex && content.letterIndex.entries.length > 1
      ? content.letterIndex
      : undefined;

  return (
    <>
      <aside className={sidebarColumn()}>
        <LibraryFilterSidebar {...sidebarProps} />
      </aside>

      <div className={mainColumn()}>
        <LibraryShelfHeader controller={controller} total={total} facets={facets} shell={shell} collapsed={collapsed} />
        {isError ? (
          <div className={stateWrap()}>
            <EmptyState icon={AlertTriangle} title={t("page.error.title")} description={t("page.error.description")} />
          </div>
        ) : isLoading && !items ? (
          <div className={stateWrap()}>
            <Spinner size="lg" label={t("page.loading")} />
          </div>
        ) : items && items.length === 0 ? (
          <div className={stateWrap()}>
            <EmptyState
              icon={config.icon}
              title={t(config.emptyTitleKey)}
              description={t(config.emptyDescriptionKey)}
            />
          </div>
        ) : (
          <>
            <div className={resultsShell()}>
              {isRefreshing ? (
                <div className={resultsOverlay()}>
                  <Spinner size="lg" label={t("page.loading")} />
                </div>
              ) : null}
              {letterIndex ? <LibraryLetterIndex index={letterIndex} scrollRoot={scrollRoot} /> : null}
              <div
                ref={setScrollRoot}
                className={resultsScroll({ stale: isRefreshing, indexed: letterIndex !== undefined })}
                onKeyDown={content.layout === "grid" ? content.onKeyDown : undefined}
              >
                {content.layout === "table" ? (
                  <>
                    <LibraryTable
                      items={items ?? []}
                      columns={content.columns}
                      getRowId={content.getRowId}
                      emptyMessage={t(config.emptyTitleKey)}
                      selection={content.selection}
                      rows={content.rows}
                    />
                    <LibraryLoadMore
                      scrollRoot={scrollRoot}
                      hasNextPage={content.hasNextPage}
                      isFetchingNextPage={content.isFetchingNextPage}
                      fetchNextPage={content.fetchNextPage}
                    />
                  </>
                ) : (
                  <>
                    {content.bulkBar}
                    <LibraryInfiniteGrid
                      items={items ?? []}
                      ariaLabel={t(config.labelKey)}
                      density={shell.phone ? shell.density : "comfortable"}
                      renderCard={content.renderCard}
                      getCardId={content.getCardId}
                      scrollRoot={scrollRoot}
                      hasNextPage={content.hasNextPage}
                      isFetchingNextPage={content.isFetchingNextPage}
                      fetchNextPage={content.fetchNextPage}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <LibraryFilterSheet
        {...sidebarProps}
        open={shell.filtersOpen}
        onOpenChange={shell.onFiltersOpenChange}
        total={total}
      />
    </>
  );
}
