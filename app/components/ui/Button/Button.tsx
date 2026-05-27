import { Slot } from "@radix-ui/react-slot";

import { cn } from "@utils/cn";
import { buttonVariants } from "./styles";
import type { ButtonProps } from "./types";

export function Button({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
}
