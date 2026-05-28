"use client";

import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { closeButton, mobileSearchOpenButton, searchInput } from "../../styles";
import { SEARCH_CLEAR_BUTTON_VARIANTS, SEARCH_INPUT_VARIANTS } from "../consts";
import type { SearchInputProps } from "../types";

export function SearchInput({ value, onChange, isOpen, onOpenChange }: SearchInputProps) {
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mobileInputRef.current) {
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleCloseMobile = useCallback(() => {
    onChange("");
    onOpenChange(false);
  }, [onChange, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") handleCloseMobile();
    },
    [handleCloseMobile]
  );

  return (
    <>
      <div className="relative hidden items-center sm:flex">
        <Search className="text-fg/40 pointer-events-none absolute left-3 size-4" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter..."
          className={searchInput()}
        />
        {value && (
          <button type="button" onClick={handleClear} className={closeButton()} aria-label="Clear filter">
            <X className="size-3" />
          </button>
        )}
      </div>

      <div className={cn("flex items-center sm:hidden", isOpen && "flex-1")}>
        {!isOpen && (
          <button
            onClick={() => onOpenChange(true)}
            className={mobileSearchOpenButton()}
            title="Filter requests"
            aria-label="Open filter"
          >
            <Search className="size-4" />
          </button>
        )}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="relative flex flex-1 items-center overflow-hidden"
              variants={SEARCH_INPUT_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Search className="text-fg/40 pointer-events-none absolute left-3 size-4" />
              <input
                ref={mobileInputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filter..."
                className={searchInput()}
              />
              <motion.button
                type="button"
                onClick={handleCloseMobile}
                className={closeButton()}
                variants={SEARCH_CLEAR_BUTTON_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close filter"
              >
                <X className="size-3" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
