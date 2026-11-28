"use client";

import { MotionConfig } from "framer-motion";

import { motionConfigOf } from "@modules/accessibility";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

import type { MotionProviderProps } from "./types";

export function MotionProvider({ children }: MotionProviderProps) {
  const { motion } = useAccessibility();
  return <MotionConfig reducedMotion={motionConfigOf(motion)}>{children}</MotionConfig>;
}
