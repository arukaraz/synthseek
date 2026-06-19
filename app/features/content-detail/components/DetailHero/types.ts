import type { SocialBrand } from "@components/ui/SocialIcon";
import type { ReactNode } from "react";

import type { DetailMode } from "../../types";

export interface SocialLink {
  brand: SocialBrand;
  url: string;
}

export type HeroRequestState = "request" | "requestMissing" | "inLibrary";

export interface PlaylistHeroControls {
  canEdit: boolean;
  disabledTooltip: string;
  onRename: () => void;
  onDelete: () => void;
  syncSlot?: ReactNode;
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
