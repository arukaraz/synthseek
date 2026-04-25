import { Role, type PublicUser } from "@api/__generated__/types";

export function isAdminFE(user: PublicUser | null | undefined): boolean {
  return user?.role === Role.enum.admin;
}

/**
 * Client-side replica of the backend `isOwnerOrAdmin` helper. The backend
 * enforces the real check; this is only to decide whether to render UI
 * affordances (buttons, menus) without flashing them for unauthorized users.
 */
export function isOwnerOrAdminFE(
  owner: { id: string } | null | undefined,
  currentUser: PublicUser | null | undefined
): boolean {
  if (!currentUser) return false;
  if (isAdminFE(currentUser)) return true;
  return owner?.id === currentUser.id;
}
