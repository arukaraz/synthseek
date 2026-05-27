"use client";

import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { closeButton, searchInput } from "../../styles";
import { SEARCH_CLEAR_BUTTON_VARIANTS, SEARCH_INPUT_VARIANTS } from "../consts";
import type { SearchInputProps } from "../types";

export function SearchInput({ value, onChange, isOpen, onOpenChange }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onChange("");
    onOpenChange(false);
  }, [onChange, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  return (
    <div className={cn("flex items-center", isOpen && "flex-1 sm:flex-initial")}>
      <button
        onClick={() => onOpenChange(true)}
        className={cn(
          "text-fg/40 hover:bg-fg/10 hover:text-fg/80 rounded-lg p-1.5 transition-colors",
          isOpen && "text-fg/80",
          isOpen && "hidden sm:inline-flex"
        )}
        title="Search requests"
        aria-label="Open search"
      >
        <Search className="size-3.5" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="relative flex flex-1 items-center overflow-hidden sm:flex-initial"
            variants={SEARCH_INPUT_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Search className="text-fg/40 pointer-events-none absolute left-3 size-4 sm:hidden" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className={searchInput()}
            />
            <motion.button
              type="button"
              onClick={handleClose}
              className={closeButton()}
              variants={SEARCH_CLEAR_BUTTON_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close search"
            >
              <X className="size-3" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
