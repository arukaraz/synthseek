import type { Variants } from "framer-motion";

export const QUEUE_ADD_CONFIRM_MS = 1400;

export const queueAddSwap: Variants = {
  enter: { opacity: 0, scale: 0.5, rotate: -90 },
  settled: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.18, ease: "easeOut" } },
  leave: { opacity: 0, scale: 0.5, rotate: 90, transition: { duration: 0.12, ease: "easeIn" } },
};
