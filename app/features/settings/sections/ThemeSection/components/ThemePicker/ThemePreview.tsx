"use client";

import { themeCardPreview } from "./styles";
import { ThemePreviewWindow } from "./ThemePreviewWindow";
import type { ThemePreviewProps } from "./types";

export function ThemePreview({ paint }: ThemePreviewProps) {
  return (
    <div
      className={themeCardPreview()}
      data-theme={paint.theme}
      data-theme-base={paint.base}
      style={paint.vars}
      aria-hidden="true"
    >
      <ThemePreviewWindow />
    </div>
  );
}
