import type { Variants } from "framer-motion";

export const TABLE_ROW_VARIANTS: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const TABLE_ROW_TRANSITION_DURATION = 0.15;

export const TABLE_HEADER_SORT_INDICATOR_VARIANTS: Variants = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  exit: { scale: 0 },
};

export const DEFAULT_STAGGER_DELAY = 0;
