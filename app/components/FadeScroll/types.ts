import type { ReactNode } from "react";

import type { ScrollAxis } from "@hooks/ui/types";

export interface FadeScrollProps {
  axis?: ScrollAxis;
  className?: string;
  label?: string;
  children: ReactNode;
}
