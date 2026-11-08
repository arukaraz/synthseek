"use client";

import { PHONE_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { useSheetDrag } from "@hooks/ui/useSheetDrag";
import { cn } from "@utils/cn";

import { Dialog, DialogContent } from "../Dialog";
import { bottomSheetContent, bottomSheetHandle } from "./styles";
import type { BottomSheetProps } from "./types";

export function BottomSheet({
  open,
  onOpenChange,
  size,
  placement,
  className,
  children,
  ...contentProps
}: BottomSheetProps) {
  const phone = useMediaQuery(PHONE_QUERY);
  const dragRef = useSheetDrag({ onDismiss: () => onOpenChange(false), enabled: phone });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dragRef}
        animation="sheet"
        className={cn(bottomSheetContent({ size }), className)}
        {...contentProps}
      >
        <div className={bottomSheetHandle({ placement })} aria-hidden="true" />
        {children}
      </DialogContent>
    </Dialog>
  );
}
