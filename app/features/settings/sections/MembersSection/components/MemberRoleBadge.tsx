import { RoleChip } from "@components/ui/RoleChip";

import { roleLabel, roleTone } from "../helpers";
import type { MemberCellProps } from "../types";

export function MemberRoleBadge({ member }: MemberCellProps) {
  return <RoleChip tone={roleTone(member)} label={roleLabel(member)} />;
}
