"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TableDataRow } from "./TableDataRow";
import type { TableBodyProps } from "./types";

export function TableBody<TData>({
  columns,
  data,
  getRowId,
  selectable,
  selectedIds,
  onSelectRow,
  onRowClick,
  isRowClickable,
  emptyMessage = "No items to display",
}: TableBodyProps<TData>) {
  return (
    <tbody data-cy="content-browser-table-body">
      <AnimatePresence mode="popLayout">
        {data.length === 0 ? (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-fg/50 px-4 py-12 text-center">
              {emptyMessage}
            </td>
          </motion.tr>
        ) : (
          data.map((item) => {
            const rowId = getRowId(item);
            const isSelected = selectedIds?.has(rowId) || false;
            const clickable = isRowClickable ? isRowClickable(item) : false;

            return (
              <TableDataRow
                key={rowId}
                item={item}
                columns={columns}
                selectable={selectable}
                isSelected={isSelected}
                clickable={clickable}
                onSelect={() => onSelectRow?.(rowId)}
                onClick={() => onRowClick?.(item)}
              />
            );
          })
        )}
      </AnimatePresence>
    </tbody>
  );
}
