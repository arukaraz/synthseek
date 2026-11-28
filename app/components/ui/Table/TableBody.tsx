"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FIRST_BODY_ROW_INDEX } from "./consts";
import { tableBody, tableEmptyCell, tableExpansionCell, tableGroupCell } from "./styles";
import { TableRow } from "./TableRow";
import type { TableBodyProps } from "./types";

export function TableBody<TData>({
  columns,
  spanCount,
  data,
  getRowId,
  emptyMessage,
  rowAttrs,
  staggerDelay,
  onRowClick,
  isRowClickable,
  numbered = false,
  renderExpansion,
  renderGroupHeader,
}: TableBodyProps<TData>) {
  return (
    <tbody className={tableBody()}>
      <AnimatePresence mode="popLayout">
        {data.length === 0 ? (
          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <td colSpan={spanCount} className={tableEmptyCell()}>
              {emptyMessage}
            </td>
          </motion.tr>
        ) : (
          data.flatMap((item, index) => {
            const id = getRowId(item);
            const clickable = isRowClickable ? isRowClickable(item) : !!onRowClick;
            const groupHeader = renderGroupHeader?.(item, index);
            const expansion = renderExpansion?.(item);
            return [
              groupHeader ? (
                <tr key={`${id}-group`}>
                  <td colSpan={spanCount} className={tableGroupCell()}>
                    {groupHeader}
                  </td>
                </tr>
              ) : null,
              <TableRow
                key={id}
                item={item}
                columns={columns}
                index={index}
                rowIndex={numbered ? index + FIRST_BODY_ROW_INDEX : undefined}
                staggerDelay={staggerDelay}
                attrs={rowAttrs?.(item)}
                clickable={clickable}
                onClick={() => onRowClick?.(item)}
              />,
              expansion ? (
                <tr key={`${id}-expansion`}>
                  <td colSpan={spanCount} className={tableExpansionCell()}>
                    {expansion}
                  </td>
                </tr>
              ) : null,
            ].filter((node) => node !== null);
          })
        )}
      </AnimatePresence>
    </tbody>
  );
}
