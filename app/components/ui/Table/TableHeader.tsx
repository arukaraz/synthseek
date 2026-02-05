"use client";

import { checkboxInput } from "../styles";
import { TableHeaderCell } from "./TableHeaderCell";
import type { TableHeaderProps } from "./types";

export function TableHeader<TData>({
  columns,
  selectable,
  sortable,
  sortState,
  onSort,
  allSelected,
  someSelected,
  onSelectAll,
}: TableHeaderProps<TData>) {
  return (
    <thead data-cy="content-browser-table-header">
      <tr className="border-fg/10 bg-fg/5 border-b" data-cy="content-browser-header-row">
        {selectable && (
          <th className="w-12 px-4 py-3">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected || false;
              }}
              onChange={onSelectAll}
              className={checkboxInput()}
            />
          </th>
        )}

        {columns.map((column) => (
          <TableHeaderCell
            key={column.key}
            column={column}
            sortable={sortable && column.sortable}
            isActive={sortState?.column === column.key}
            direction={sortState?.direction}
            onSort={onSort}
          />
        ))}
      </tr>
    </thead>
  );
}
