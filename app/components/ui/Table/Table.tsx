"use client";

import { useDisplayedCellCount } from "@hooks/ui/useDisplayedCellCount";
import { useOverflowsX } from "@hooks/ui/useOverflowsX";
import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";
import { DEFAULT_STAGGER_DELAY } from "./consts";
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
  renderExpansion,
  renderGroupHeader,
}: DataTableProps<TData>) {
  const { t } = useTranslation("components");
  const [scrollRef, overflowsX] = useOverflowsX<HTMLDivElement>();
  const [headerRowRef, displayedColumns] = useDisplayedCellCount<HTMLTableRowElement>();
  return (
    <div className={cn(tableContainer(), containerClassName)} style={stickyOffsetVars(overflowsX ? 0 : stickyOffset)}>
      <div ref={scrollRef} className={tableScroll({ viewport: overflowsX })}>
        <table
          className={table({ layout: fixedLayout ? "fixed" : "auto" })}
          style={minWidth ? { minWidth } : undefined}
        >
          <TableHeader columns={columns} sortState={sortState} onSort={onSort} rowRef={headerRowRef} />
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
            renderExpansion={renderExpansion}
            renderGroupHeader={renderGroupHeader}
          />
        </table>
      </div>
    </div>
  );
}
