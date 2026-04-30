"use client";

import { cn } from "@utils/cn";
import { DEFAULT_EMPTY_MESSAGE, DEFAULT_STAGGER_DELAY } from "./consts";
import { table, tableContainer, tableScroll } from "./styles";
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
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  rowAttrs,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  onRowClick,
  isRowClickable,
}: DataTableProps<TData>) {
  return (
    <div className={cn(tableContainer(), containerClassName)}>
      <div className={tableScroll()}>
        <table className={table()} style={minWidth ? { minWidth } : undefined}>
          <TableHeader columns={columns} sortState={sortState} onSort={onSort} />
          <TableBody
            columns={columns}
            data={data}
            getRowId={getRowId}
            emptyMessage={emptyMessage}
            rowAttrs={rowAttrs}
            staggerDelay={staggerDelay}
            onRowClick={onRowClick}
            isRowClickable={isRowClickable}
          />
        </table>
      </div>
    </div>
  );
}
