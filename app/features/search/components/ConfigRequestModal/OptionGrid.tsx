"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fieldGroup } from "./styles";
import type { OptionGridProps } from "./types";

export function OptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  showCheckmark = false,
  disabled = false,
}: OptionGridProps<T>) {
  const gridCols = columns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn(fieldGroup(), disabled && "pointer-events-none opacity-40")} aria-disabled={disabled}>
      <label className="text-fg/90 text-sm font-medium">{label}</label>
      <div className={cn("grid gap-3 sm:gap-4", gridCols)}>
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <motion.button
              key={String(option.value)}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "touch-target relative overflow-hidden rounded-lg border px-3 py-2.5 text-center transition-all sm:py-2",
                isSelected
                  ? "bg-primary-500/20 border-primary-500/50 text-fg ring-primary-500/50 ring-1"
                  : "bg-fg/5 border-fg/10 text-fg/70 hover:bg-fg/10 hover:border-primary-500/30"
              )}
              whileHover={disabled ? undefined : { scale: 1.02 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
            >
              {isSelected && <div className="bg-primary-500 absolute -inset-px rounded-lg opacity-20 blur-md" />}
              <div className="relative z-10 flex items-center justify-center gap-2">
                {showCheckmark && isSelected && <Check className="text-primary-400 h-4 w-4" />}
                <div>
                  <div className="text-sm font-bold">{option.label}</div>
                  <div className={cn("text-xs", isSelected ? "text-primary-400" : "text-fg/50")}>
                    {option.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
