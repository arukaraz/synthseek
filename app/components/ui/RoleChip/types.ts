export type RoleTone = "owner" | "admin" | "member";

export interface RoleChipProps {
  tone: RoleTone;
  label: string;
  className?: string;
}
