"use client";

import { tableHeader, tableHeaderRow } from "./styles";
import { TableHeaderCell } from "./TableHeaderCell";
import type { TableHeaderProps } from "./types";

export function TableHeader<TData>({ columns, sortState, onSort, rowRef }: TableHeaderProps<TData>) {
  return (
    <thead className={tableHeader()}>
      <tr ref={rowRef} className={tableHeaderRow()}>
        {columns.map((column) => (
          <TableHeaderCell
            key={column.key}
            column={column}
            isActive={sortState?.field === column.key}
            direction={sortState?.field === column.key ? sortState.direction : null}
            onSort={onSort}
          />
        ))}
      </tr>
    </thead>
  );
}
