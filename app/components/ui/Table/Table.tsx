"use client";

import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";
import { DEFAULT_STAGGER_DELAY } from "./consts";
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
  fixedLayout = false,
  emptyMessage,
  rowAttrs,
  staggerDelay = DEFAULT_STAGGER_DELAY,
  onRowClick,
  isRowClickable,
}: DataTableProps<TData>) {
  const { t } = useTranslation("components");
  return (
    <div className={cn(tableContainer(), containerClassName)}>
      <div className={tableScroll()}>
        <table
          className={table({ layout: fixedLayout ? "fixed" : "auto" })}
          style={minWidth ? { minWidth } : undefined}
        >
          <TableHeader columns={columns} sortState={sortState} onSort={onSort} />
          <TableBody
            columns={columns}
            data={data}
            getRowId={getRowId}
            emptyMessage={emptyMessage ?? t("table.empty")}
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
