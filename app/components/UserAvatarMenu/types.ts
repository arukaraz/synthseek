import type { RoleTone } from "@components/ui/RoleChip";

export interface MenuHeaderBlockProps {
  username: string;
  email: string;
  avatarUrl: string | null;
  roleTone: RoleTone;
  roleLabel: string;
}

export interface MenuUpdateSectionProps {
  latestVersion: string;
  currentVersion: string;
  breaking: boolean;
  onNavigate: () => void;
}

export interface TriggerAvatarProps {
  username: string;
  avatarUrl: string | null;
  updateAvailable: boolean;
}
