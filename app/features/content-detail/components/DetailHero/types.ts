import type { SocialBrand } from "@components/ui/SocialIcon";
import type { ReactNode } from "react";

import type { DetailMode } from "../../types";

export interface SocialLink {
  brand: SocialBrand;
  url: string;
}

export type HeroRequestState = "request" | "requestMissing" | "inLibrary";

export interface PlaylistHeroLabels {
  menu: string;
  rename: string;
  delete: string;
  nameField: string;
  save: string;
  syncToPlex: string;
  syncing: string;
}

export interface PlaylistHeroControls {
  canEdit: boolean;
  onRename: () => void;
  onDelete: () => void;
  onSyncToPlex?: () => void;
  isSyncing: boolean;
  isEditing: boolean;
  editValue: string;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  labels: PlaylistHeroLabels;
  syncBadge?: ReactNode;
}

export interface DetailHeroProps {
  mode: DetailMode;
  name: string;
  subtitle: string | null;
  cover: string | null;
  genres: string[];
  requestState: HeroRequestState;
  socials: SocialLink[];
  statsSlot?: ReactNode;
  onRequest?: () => void;
  onSubtitleClick?: () => void;
  showRequest?: boolean;
  showInLibraryPill?: boolean;
  requestDisabled?: boolean;
  requestDisabledTooltip?: string | null;
  playlistControls?: PlaylistHeroControls;
}

export interface PlaylistSyncToggleProps {
  syncEnabled: boolean;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
}

export interface ShareFanProps {
  socials: SocialLink[];
}

export interface ShareFanItemStyle {
  tx: number;
  ty: number;
  openDelay: number;
  closeDelay: number;
}

export interface GenreChipsProps {
  genres: string[];
}
