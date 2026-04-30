"use client";

import { AnimatePresence, motion } from "framer-motion";
import { tableBody, tableEmptyCell } from "./styles";
import { TableRow } from "./TableRow";
import type { TableBodyProps } from "./types";

export function TableBody<TData>({
  columns,
  data,
  getRowId,
  emptyMessage,
  rowAttrs,
  staggerDelay,
  onRowClick,
  isRowClickable,
}: TableBodyProps<TData>) {
  return (
    <tbody className={tableBody()}>
      <AnimatePresence mode="popLayout">
        {data.length === 0 ? (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={columns.length} className={tableEmptyCell()}>
              {emptyMessage}
            </td>
          </motion.tr>
        ) : (
          data.map((item, index) => {
            const clickable = isRowClickable ? isRowClickable(item) : !!onRowClick;
            return (
              <TableRow
                key={getRowId(item)}
                item={item}
                columns={columns}
                index={index}
                staggerDelay={staggerDelay}
                attrs={rowAttrs?.(item)}
                clickable={clickable}
                onClick={() => onRowClick?.(item)}
              />
            );
          })
        )}
      </AnimatePresence>
    </tbody>
  );
}
