"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@utils/cn";
import type { SwitchProps } from "./types";

export function Switch({ className, ref, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer focus-visible:ring-primary-500/40 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary-500 data-[state=unchecked]:bg-fg/15",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
          "data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Root>
  );
}
