import type { VariantProps } from "class-variance-authority";

import type { loadingDots } from "./styles";

export interface LoadingDotsProps extends VariantProps<typeof loadingDots> {
  className?: string;
  label?: string;
}
