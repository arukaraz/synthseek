"use client";

import { HighlightMedia } from "./HighlightMedia";
import { VisualPlaceholder } from "./VisualPlaceholder";
import type { HighlightVisualProps } from "./types";

export function HighlightVisual({ media, mediaPath }: HighlightVisualProps) {
  if (!media || mediaPath === null) return <VisualPlaceholder />;
  return <HighlightMedia media={media} mediaPath={mediaPath} />;
}
