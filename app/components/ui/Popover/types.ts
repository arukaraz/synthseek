import type * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";

type PopoverContentPrimitiveProps = Omit<
  ComponentProps<typeof PopoverPrimitive.Content>,
  "aria-label" | "aria-labelledby"
>;

type PopoverContentName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-labelledby": string; "aria-label"?: never };

export type PopoverContentProps = PopoverContentPrimitiveProps & PopoverContentName;
