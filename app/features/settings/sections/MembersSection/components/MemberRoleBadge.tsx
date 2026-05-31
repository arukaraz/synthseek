import { Crown, ShieldCheck } from "lucide-react";

import { roleLabel, roleTone } from "../helpers";
import { pill } from "../styles";
import type { MemberCellProps } from "../types";

export function MemberRoleBadge({ member }: MemberCellProps) {
  const tone = roleTone(member);
  return (
    <span className={pill({ tone })}>
      {tone === "owner" ? <Crown className="h-3 w-3" /> : null}
      {tone === "admin" ? <ShieldCheck className="h-3 w-3" /> : null}
      {roleLabel(member)}
    </span>
  );
}
