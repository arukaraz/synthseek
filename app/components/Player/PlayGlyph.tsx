import { cn } from "@utils/cn";
import { Loader2, Pause, Play } from "lucide-react";

import type { PlayGlyphProps } from "./types";

export function PlayGlyph({ view, spin, face }: PlayGlyphProps) {
  if (view.loading) return <Loader2 className={cn(spin, "animate-spin")} />;
  if (view.playing) return <Pause className={cn(face, "fill-current")} />;
  return <Play className={cn(face, "fill-current")} />;
}
