import type { VariantProps } from "class-variance-authority";

import type { loadingRing } from "./styles";

export interface LoadingRingProps extends VariantProps<typeof loadingRing> {
  strokeWidth?: number;
  className?: string;
}
