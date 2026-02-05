import type { ContentType } from "@api/__generated__/types";
import type { SpotifyItem } from "@api/__generated__/types";

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
  parentAlbum?: SpotifyItem;
}

export interface ContentBrowserModalProps {
  type: ContentType;
  data: SpotifyItem;
  open: boolean;
  onClose: () => void;
  onRequestClick: (item: SpotifyItem, context?: RequestContext) => void;
}
