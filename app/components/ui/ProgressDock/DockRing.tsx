"use client";

import { ringStyle } from "./helpers";
import { dockRing, dockRingText, dockRingWrap } from "./styles";
import type { DockRingProps } from "./types";

export function DockRing({ ratio, percent, status }: DockRingProps) {
  return (
    <span className={dockRingWrap()} aria-hidden="true">
      <span className={dockRing({ status })} style={ringStyle(ratio)} />
      <span className="dock-ring-disc" />
      <span className={dockRingText()}>{percent}%</span>
    </span>
  );
}
