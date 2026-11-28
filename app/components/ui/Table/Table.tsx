"use client";

import { useDisplayedCellCount } from "@hooks/ui/useDisplayedCellCount";
import { useOverflowsX } from "@hooks/ui/useOverflowsX";
import { cn } from "@utils/cn";
import { scrollRegionProps } from "@utils/scroll-region";
import { useTranslation } from "react-i18next";
import { DEFAULT_STAGGER_DELAY, HEADER_ROW_INDEX } from "./consts";
import { stickyOffsetVars, table, tableContainer, tableScroll } from "./styles";
import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";
import type { DataTableProps } from "./types";

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  sortState,
  onSort,
  containerClassName,
  minWidth,
  fixedLayout = false,
  emptyMessage,
  rowAttrs,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  onRowClick,
  isRowClickable,
  stickyOffset = 0,
  totalRows,
  renderExpansion,
  renderGroupHeader,
}: DataTableProps<TData>) {
  const { t } = useTranslation("components");
  const [scrollRef, overflowsX] = useOverflowsX<HTMLDivElement>();
  const [headerRowRef, displayedColumns] = useDisplayedCellCount<HTMLTableRowElement>();
  return (
    <div className={cn(tableContainer(), containerClassName)} style={stickyOffsetVars(overflowsX ? 0 : stickyOffset)}>
      <div
        ref={scrollRef}
        className={tableScroll({ viewport: overflowsX })}
        {...scrollRegionProps(overflowsX, t("table.scrollRegion"))}
      >
        <table
          className={table({ layout: fixedLayout ? "fixed" : "auto" })}
          style={minWidth ? { minWidth } : undefined}
          aria-rowcount={totalRows === undefined ? undefined : Math.max(totalRows, data.length) + HEADER_ROW_INDEX}
        >
          <TableHeader
            columns={columns}
            sortState={sortState}
            onSort={onSort}
            rowRef={headerRowRef}
            rowIndex={totalRows === undefined ? undefined : HEADER_ROW_INDEX}
          />
          <TableBody
            columns={columns}
            spanCount={displayedColumns ?? columns.length}
            data={data}
            getRowId={getRowId}
            emptyMessage={emptyMessage ?? t("table.empty", { defaultValue: "No items to display" })}
            rowAttrs={rowAttrs}
            staggerDelay={staggerDelay}
            onRowClick={onRowClick}
            isRowClickable={isRowClickable}
            numbered={totalRows !== undefined}
            renderExpansion={renderExpansion}
            renderGroupHeader={renderGroupHeader}
          />
        </table>
      </div>
    </div>
  );
}
