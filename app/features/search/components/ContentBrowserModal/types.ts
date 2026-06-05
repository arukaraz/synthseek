import type { ContentType, MusicItem } from "@api/__generated__/types";

export interface ContentMetadata {
  title: string;
  subtitle?: string;
  description?: string | null;
  metadata?: string;
  thumbnail: string;
  showRequestButton: boolean;
  albumCount?: number;
}

export interface RequestContext {
  parentAlbum?: MusicItem;
}

export interface ContentBrowserModalProps {
  type: ContentType;
  data: MusicItem;
  open: boolean;
  onClose: () => void;
  onRequestClick: (item: MusicItem, context?: RequestContext) => void;
  onRequestArtistLidarr?: (artist: MusicItem) => void;
  preloadedItems?: MusicItem[];
  requestButtonDisabled?: boolean;
  requestButtonTooltip?: string;
}

export interface HeroHeaderProps {
  metadata: ContentMetadata;
  type: ContentType;
  onRequestAll?: () => void;
  onRequestArtistLidarr?: () => void;
  showArtistLidarrButton?: boolean;
  onBack?: () => void;
  requestButtonDisabled?: boolean;
  requestButtonTooltip?: string;
}

export interface RequestAllButtonProps {
  onRequestAll: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export interface RequestArtistLidarrButtonProps {
  onRequest: () => void;
}

export interface ContentListProps {
  type: ContentType;
  items: MusicItem[];
  isLoading: boolean;
  isOrderedTracklist: boolean;
  onActionClick: (item: MusicItem) => void;
  onNavigate?: (item: MusicItem) => void;
}

export interface ContentListItemProps {
  item: MusicItem;
  parentType: ContentType;
  isOrderedTracklist: boolean;
  onActionClick: (item: MusicItem) => void;
  onNavigate?: (item: MusicItem) => void;
  isClickable?: boolean;
}
