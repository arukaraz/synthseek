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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("components");
  const { start, end } = pageRangeLabel(page, pageSize, totalItems);
  const pages = buildPageRange(page, pageCount);

  return (
    <div className={cn(paginationContainer(), className)}>
      <p className={paginationSummary()}>
        {t("pagination.summary", {
          start: start.toLocaleString(),
          end: end.toLocaleString(),
          total: totalItems.toLocaleString(),
        })}
      </p>

      <div className={paginationControls()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={paginationSizeTrigger()} aria-label={t("pagination.rowsPerPage")}>
              {t("pagination.perPage", { size: pageSize })}
              <ChevronDown className="size-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-28">
            <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              {pageSizeOptions.map((size) => (
                <DropdownMenuRadioItem key={size} value={String(size)}>
                  {t("pagination.perPage", { size })}
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
            aria-label={t("pagination.previousPage")}
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className={paginationMobilePage()}>{t("pagination.mobilePage", { page, pageCount })}</span>

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
                  aria-label={t("pagination.goToPage", { page: item })}
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
            aria-label={t("pagination.nextPage")}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
