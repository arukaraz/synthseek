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
}
