import type { VariantProps } from "class-variance-authority";

import type { spinnerRing } from "./styles";

export interface SpinnerProps extends VariantProps<typeof spinnerRing> {
  className?: string;
  label?: string;
  decorative?: boolean;
}
