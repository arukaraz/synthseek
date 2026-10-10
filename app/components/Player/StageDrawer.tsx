"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { stageDrawer, stageDrawerFade } from "@utils/animations";

import { stageDrawerFrame } from "./styles";
import type { StageDrawerProps } from "./types";

export function StageDrawer({ open, children }: StageDrawerProps) {
  const reduceMotion = useReducedMotion() === true;

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          className={stageDrawerFrame()}
          variants={reduceMotion ? stageDrawerFade : stageDrawer}
          initial="closed"
          animate="open"
          exit="closed"
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
