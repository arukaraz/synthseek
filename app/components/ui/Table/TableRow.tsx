"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { TABLE_ROW_TRANSITION_DURATION, TABLE_ROW_VARIANTS } from "./consts";
import { tableCell, tableRow } from "./styles";
import type { TableRowProps } from "./types";

export function TableRow<TData>({
  item,
  columns,
  index,
  staggerDelay,
  attrs,
  clickable,
  onClick,
}: TableRowProps<TData>) {
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) return;
    if (clickable && onClick) onClick();
  };

  return (
    <motion.tr
      variants={TABLE_ROW_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: TABLE_ROW_TRANSITION_DURATION, delay: staggerDelay * index }}
      className={tableRow({ clickable })}
      onClick={handleClick}
      {...attrs}
    >
      {columns.map((column) => (
        <td key={column.key} className={cn(tableCell(), column.className)}>
          {column.cell(item)}
        </td>
      ))}
    </motion.tr>
  );
}
