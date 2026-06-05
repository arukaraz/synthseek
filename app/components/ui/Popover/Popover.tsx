"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@utils/cn";
import type { PopoverContentProps } from "./types";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({ className, sideOffset = 6, align = "center", ref, ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "border-fg/20 bg-surface-overlay/98 text-fg/90 z-50 max-w-xs rounded-md border px-2.5 py-1.5 text-xs shadow-xl outline-none sm:backdrop-blur-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
