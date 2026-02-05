"use client";

import { cn } from "@utils/cn";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { searchInput, closeButton } from "../../styles";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile: boolean;
}

const slideVariants: Variants = {
  hidden: {
    width: 0,
    opacity: 0,
    marginLeft: 0,
  },
  visible: {
    width: "auto",
    opacity: 1,
    marginLeft: 8,
    transition: {
      width: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.15, delay: 0.05 },
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    marginLeft: 0,
    transition: {
      width: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.1 },
    },
  },
};

const mobileVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const clearButtonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export function SearchInput({ value, onChange, isOpen, onOpenChange, isMobile }: SearchInputProps) {
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
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose]
  );

  const SearchTrigger = (
    <button
      onClick={() => onOpenChange(true)}
      className={cn(
        "text-fg/40 hover:bg-fg/10 hover:text-fg/80 rounded-lg p-1.5 transition-colors",
        isOpen && !isMobile && "text-fg/80"
      )}
      title="Search requests"
      aria-label="Open search"
    >
      <Search className="size-3.5" />
    </button>
  );

  if (isMobile) {
    return (
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div key="trigger" layout>
            {SearchTrigger}
          </motion.div>
        ) : (
          <motion.div
            key="input"
            className="flex flex-1 items-center"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative flex flex-1 items-center">
              <Search className="text-fg/40 pointer-events-none absolute left-3 size-4" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search requests..."
                className={searchInput({ width: "full" })}
              />
              <motion.button
                type="button"
                onClick={handleClose}
                className={closeButton()}
                variants={clearButtonVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close search"
              >
                <X className="size-3" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="flex items-center">
      {SearchTrigger}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="relative flex items-center overflow-hidden"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className={searchInput({ width: "fixed" })}
            />
            <motion.button
              type="button"
              onClick={handleClose}
              className={closeButton()}
              variants={clearButtonVariants}
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
