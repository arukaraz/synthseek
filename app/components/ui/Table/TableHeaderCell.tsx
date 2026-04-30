"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TABLE_HEADER_SORT_INDICATOR_VARIANTS } from "./consts";
import { tableHead, tableHeadSortable } from "./styles";
import type { TableHeaderCellProps } from "./types";

export function TableHeaderCell<TData>({ column, isActive, direction, onSort }: TableHeaderCellProps<TData>) {
  const content = typeof column.header === "function" ? column.header() : column.header;

  if (!column.sortable || !onSort) {
    return (
      <th className={cn(tableHead(), column.className)}>
        <span>{content}</span>
      </th>
    );
  }

  return (
    <th className={cn(tableHead(), column.className)}>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className={tableHeadSortable({ active: isActive })}
        data-sort-active={isActive}
        data-sort-direction={direction ?? undefined}
      >
        <span>{content}</span>
        {isActive && direction && (
          <motion.div
            variants={TABLE_HEADER_SORT_INDICATOR_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {direction === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
          </motion.div>
        )}
      </button>
    </th>
  );
}
