import { cn } from "@utils/cn";
import { BadgeCheck, Crown, ShieldCheck } from "lucide-react";

import { roleChip } from "./styles";
import type { RoleChipProps } from "./types";

export function RoleChip({ tone, label, className }: RoleChipProps) {
  return (
    <span className={cn(roleChip({ tone }), className)}>
      {tone === "owner" ? <Crown aria-hidden className="h-3 w-3" /> : null}
      {tone === "admin" ? <ShieldCheck aria-hidden className="h-3 w-3" /> : null}
      {tone === "trusted" ? <BadgeCheck aria-hidden className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}
