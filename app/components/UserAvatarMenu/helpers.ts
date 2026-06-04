import { Role, type PublicUser } from "@api/__generated__/types";
import type { RoleTone } from "@components/ui/RoleChip";
import i18n from "@locale";

export function menuRoleTone(role: PublicUser["role"]): RoleTone {
  return role === Role.enum.admin ? "admin" : "member";
}

export function menuRoleLabel(role: PublicUser["role"]): string {
  return role === Role.enum.admin ? i18n.t("components:userMenu.roleAdmin") : i18n.t("components:userMenu.roleUser");
}
