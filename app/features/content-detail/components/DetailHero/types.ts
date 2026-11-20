import type { PlaylistVisibility } from "@api/__generated__/types";
import type { SocialBrand } from "@components/ui/SocialIcon";
import type { ReactNode } from "react";

import type { DegradedSource, DetailMode } from "../../types";

export interface SocialLink {
  brand: SocialBrand;
  url: string;
}

export type HeroRequestState = "request" | "requestMissing" | "inLibrary";

export interface HeroVisibilityChoice {
  value: PlaylistVisibility;
  onChange: (next: PlaylistVisibility) => void;
  disabled: boolean;
}

export interface PlaylistHeroControls {
  syncBadge?: ReactNode;
  quietRequest?: boolean;
  missingCount?: number;
  onOpenWorkshop?: () => void;
  visibility?: HeroVisibilityChoice;
}

export interface HeroPlaylistToolsProps {
  onOpenWorkshop: () => void;
  visibility?: HeroVisibilityChoice;
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
  followSlot?: ReactNode;
  onRequest?: () => void;
  onCustomizeRequest?: () => void;
  onPlay?: () => Promise<void>;
  onShuffle?: () => Promise<void>;
  onStartRadio?: () => Promise<void>;
  onEnqueue?: () => Promise<void>;
  onSubtitleClick?: () => void;
  showRequest?: boolean;
  showInLibraryPill?: boolean;
  requestDisabled?: boolean;
  requestDisabledTooltip?: string | null;
  playlistControls?: PlaylistHeroControls;
  degradedSources?: DegradedSource[];
}

export interface HeroPlaySplitProps {
  mode: DetailMode;
  name: string;
  onPlay: () => Promise<void>;
  onShuffle?: () => Promise<void>;
  onStartRadio?: () => Promise<void>;
  onEnqueue?: () => Promise<void>;
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
