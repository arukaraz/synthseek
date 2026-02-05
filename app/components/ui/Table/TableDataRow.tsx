"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { Checkbox } from "@components/ui/Checkbox";
import type { TableDataRowProps } from "./types";

export function TableDataRow<TData>({
  item,
  columns,
  selectable,
  isSelected,
  clickable,
  onSelect,
  onClick,
}: TableDataRowProps<TData>) {
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) {
      return;
    }
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
      transition={{ duration: 0.15 }}
      className={cn("group border-fg/5 border-b", clickable && "cursor-pointer")}
      onClick={handleClick}
      data-cy="content-browser-row"
    >
      {selectable && (
        <td className="w-12 px-4 py-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="border-fg/20 data-[state=checked]:border-primary-600 data-[state=checked]:bg-primary-600"
          />
        </td>
      )}

      {columns.map((column) => (
        <td key={column.key} className={cn("text-fg/70 px-4 py-3", column.className)}>
          {column.cell ? column.cell(item) : "-"}
        </td>
      ))}
    </motion.tr>
  );
}
