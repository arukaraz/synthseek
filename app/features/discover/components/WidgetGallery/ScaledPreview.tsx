"use client";

import { previewFit, previewStage, previewVars } from "./styles";
import type { ScaledPreviewProps } from "./types";

export function ScaledPreview({ frame, children }: ScaledPreviewProps) {
  return (
    <div className={previewFit()} style={previewVars(frame)} aria-hidden inert>
      <div className={previewStage()}>{children}</div>
    </div>
  );
}
