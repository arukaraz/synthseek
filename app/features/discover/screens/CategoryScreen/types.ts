import type { ContentType, MusicItem } from "@api/__generated__/types";

export type FilterType = ContentType | "all";

export interface CategoryModalState {
  selectedItem: MusicItem | null;
  selectedItemType: ContentType;
  showContentBrowserModal: boolean;
  showConfigRequestModal: boolean;
  selectedContentToRequest: MusicItem | null;
  parentAlbumFromContext: MusicItem | null;
}
