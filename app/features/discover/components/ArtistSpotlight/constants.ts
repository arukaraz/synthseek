import type { Variants } from "framer-motion";

export const ARTIST_SPOTLIGHT_COUNT = 4;

const SWAP_STAGGER_S = 0.06;

export const SWAP_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  visible: (order: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: order * SWAP_STAGGER_S },
  }),
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.16, ease: "easeIn" } },
};

export const SWAP_VARIANTS_REDUCED: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};
