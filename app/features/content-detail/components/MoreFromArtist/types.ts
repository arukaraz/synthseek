import type { RefObject } from "react";

import type { ContentCardItem } from "../../types";

export interface MoreFromArtistProps {
  albums: ContentCardItem[];
  onSelectAlbum: (item: ContentCardItem) => void;
  trackRef: RefObject<HTMLDivElement | null>;
}
