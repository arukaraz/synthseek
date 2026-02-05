"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { SortDirection } from "@features/requests/types";

interface SortableHeaderProps {
  label: string;
  field: string;
  currentField: string;
  direction: SortDirection;
  onSort: (field: string) => void;
}

export function SortableHeader({ label, field, currentField, direction, onSort }: SortableHeaderProps) {
  const isActive = currentField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 text-left text-xs font-medium tracking-wider uppercase transition-colors",
        isActive ? "text-primary-400" : "text-fg/40 hover:text-fg/60"
      )}
    >
      {label}
      <motion.div initial={false} animate={{ opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.15 }}>
        {isActive ? (
          direction === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3" />
        )}
      </motion.div>
    </button>
  );
}
