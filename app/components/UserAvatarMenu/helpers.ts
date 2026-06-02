import { Role, type PublicUser } from "@api/__generated__/types";
import type { RoleTone } from "@components/ui/RoleChip";

export function menuRoleTone(role: PublicUser["role"]): RoleTone {
  return role === Role.enum.admin ? "admin" : "member";
}

export function menuRoleLabel(role: PublicUser["role"]): string {
  return role === Role.enum.admin ? "Admin" : "User";
}
