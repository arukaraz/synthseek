"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { TableHeaderCellProps } from "./types";

export function TableHeaderCell<TData>({ column, sortable, isActive, direction, onSort }: TableHeaderCellProps<TData>) {
  const content = column.header?.() || column.label;

  if (!sortable) {
    return (
      <th
        className={cn("px-4 py-3 text-sm font-semibold", column.className)}
        data-cy={`content-browser-header-${column.key}`}
      >
        <span className="text-fg/80">{content}</span>
      </th>
    );
  }

  return (
    <th className={cn("px-4 py-3 text-sm font-semibold", column.className)}>
      <button
        onClick={() => onSort?.(column.key)}
        className={cn(
          "flex items-center gap-1.5 transition-colors",
          isActive ? "text-fg" : "text-fg/80 hover:text-fg/90",
          column.className?.includes("text-right") && "ml-auto"
        )}
        data-cy={`content-browser-sort-${column.key}`}
        data-sort-active={isActive}
        data-sort-direction={direction}
      >
        <span>{content}</span>
        {isActive && direction && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            {direction === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          </motion.div>
        )}
      </button>
    </th>
  );
}
