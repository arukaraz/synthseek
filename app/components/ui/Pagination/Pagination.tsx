"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { cn } from "@utils/cn";
import { ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { buildPageRange, pageRangeLabel } from "./helpers";
import {
  paginationContainer,
  paginationControls,
  paginationEllipsis,
  paginationMobilePage,
  paginationNav,
  paginationNavButton,
  paginationPageButton,
  paginationPages,
  paginationSizeTrigger,
  paginationSummary,
} from "./styles";
import type { PaginationProps } from "./types";

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const { start, end } = pageRangeLabel(page, pageSize, totalItems);
  const pages = buildPageRange(page, pageCount);

  return (
    <div className={cn(paginationContainer(), className)}>
      <p className={paginationSummary()}>
        Showing {start.toLocaleString()}-{end.toLocaleString()} of {totalItems.toLocaleString()}
      </p>

      <div className={paginationControls()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={paginationSizeTrigger()} aria-label="Rows per page">
              {pageSize} / page
              <ChevronDown className="size-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-28">
            <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              {pageSizeOptions.map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>
                  {size} / page
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={paginationNav()}>
          <button
            type="button"
            className={paginationNavButton()}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className={paginationMobilePage()}>
            Page {page} of {pageCount}
          </span>

          <div className={paginationPages()}>
            {pages.map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className={paginationEllipsis()}>
                  <MoreHorizontal className="size-3.5" />
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={paginationPageButton({ active: item === page })}
                  onClick={() => onPageChange(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                >
                  {item}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className={paginationNavButton()}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
