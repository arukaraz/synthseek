import type * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentProps } from "react";

export type CheckboxPreview = "none" | "select" | "clear";

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  preview?: CheckboxPreview;
};
