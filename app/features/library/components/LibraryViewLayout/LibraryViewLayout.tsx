"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { Pagination } from "@components/ui/Pagination";
import { Spinner } from "@components/ui/Spinner";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { LIBRARY_PAGE_SIZE_OPTIONS } from "../../constants";
import { computePageCount, countActiveFilters, toggleFilterValue } from "../../helpers";
import { mainColumn, resultsScroll, sidebarColumn, stateWrap } from "../../styles";
import { LibraryInfiniteGrid } from "../LibraryCard";
import { LibraryFilterSheet } from "../LibraryFilterSheet/LibraryFilterSheet";
import { LibraryFilterSidebar } from "../LibraryFilterSidebar/LibraryFilterSidebar";
import type { LibraryFilterSidebarProps } from "../LibraryFilterSidebar/types";
import { LibraryTable } from "../LibraryTable/LibraryTable";
import type { LibraryViewLayoutProps } from "./types";

export function LibraryViewLayout<TItem>({
  controller,
  items,
  total,
  facets,
  isLoading,
  isError,
  content,
  filtersOpen,
  onFiltersOpenChange,
}: LibraryViewLayoutProps<TItem>) {
  const { t } = useTranslation("library");
  const { config } = controller;
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const activeFilterCount = countActiveFilters(controller.filters);

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
  };

  const pageCount = computePageCount(total, controller.pageSize);

  return (
    <>
      <aside className={sidebarColumn()}>
        <LibraryFilterSidebar {...sidebarProps} />
      </aside>

      <div className={mainColumn()}>
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
            <div ref={setScrollRoot} className={resultsScroll()}>
              {content.layout === "table" ? (
                <LibraryTable
                  items={items ?? []}
                  columns={content.columns}
                  getRowId={content.getRowId}
                  emptyMessage={t(config.emptyTitleKey)}
                  selection={content.selection}
                />
              ) : (
                <LibraryInfiniteGrid
                  items={items ?? []}
                  ariaLabel={t(config.labelKey)}
                  renderCard={content.renderCard}
                  getCardId={content.getCardId}
                  scrollRoot={scrollRoot}
                  hasNextPage={content.hasNextPage}
                  isFetchingNextPage={content.isFetchingNextPage}
                  fetchNextPage={content.fetchNextPage}
                />
              )}
            </div>
            {content.layout === "table" ? (
              <Pagination
                page={controller.page}
                pageCount={pageCount}
                pageSize={controller.pageSize}
                totalItems={total}
                pageSizeOptions={[...LIBRARY_PAGE_SIZE_OPTIONS]}
                onPageChange={controller.setPage}
                onPageSizeChange={controller.setPageSize}
              />
            ) : null}
          </>
        )}
      </div>

      <LibraryFilterSheet {...sidebarProps} open={filtersOpen} onOpenChange={onFiltersOpenChange} />
    </>
  );
}
