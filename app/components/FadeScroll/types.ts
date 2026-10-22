import type { ReactNode } from "react";

import type { ScrollAxis } from "@hooks/ui/types";

export type ScrollEdgeSide = "left" | "right";

export interface FadeScrollProps {
  axis?: ScrollAxis;
  arrows?: boolean;
  className?: string;
  label?: string;
  children: ReactNode;
}

export interface ScrollEdgeProps {
  side: ScrollEdgeSide;
  visible: boolean;
  shade?: boolean;
  label: string;
  onClick: () => void;
}
