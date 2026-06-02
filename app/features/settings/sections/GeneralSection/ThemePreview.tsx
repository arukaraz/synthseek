"use client";

import { themeCardPreview } from "./styles";
import { ThemePreviewWindow } from "./ThemePreviewWindow";
import type { ThemePreviewProps } from "./types";

export function ThemePreview({ preview }: ThemePreviewProps) {
  return (
    <div className={themeCardPreview()} data-theme={preview} aria-hidden="true">
      <ThemePreviewWindow />
    </div>
  );
}
