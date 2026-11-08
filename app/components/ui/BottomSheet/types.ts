import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import type { DialogContentProps } from "../Dialog";
import type { bottomSheetContent, bottomSheetHandle } from "./styles";

export type BottomSheetProps = Omit<DialogContentProps, "animation" | "ref"> &
  VariantProps<typeof bottomSheetContent> &
  VariantProps<typeof bottomSheetHandle> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };

export interface BottomSheetHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
}
