export type RoleTone = "owner" | "admin" | "trusted" | "member";

export interface RoleChipProps {
  tone: RoleTone;
  label: string;
  className?: string;
}
