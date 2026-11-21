import { cn } from "@utils/cn";
import { badgeVariants } from "./styles";
import type { BadgeProps } from "./types";

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div data-part="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
