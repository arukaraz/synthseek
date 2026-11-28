"use client";

import { useAccessibility } from "@modules/providers/AccessibilityProvider";
import { cn } from "@utils/cn";
import { Loader2, Pause, Play, TriangleAlert } from "lucide-react";

import type { PlayGlyphProps } from "./types";

export function PlayGlyph({ view, spin, face }: PlayGlyphProps) {
  const { mode } = useAccessibility();
  if (view.loading) return <Loader2 className={cn(spin, "animate-spin")} />;
  if (mode && view.failing) return <TriangleAlert className={face} />;
  if (view.playing) return <Pause className={cn(face, "fill-current")} />;
  return <Play className={cn(face, "fill-current")} />;
}
