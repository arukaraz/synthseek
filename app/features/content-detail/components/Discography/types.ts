import type { ContentCardItem } from "../../types";

export type DiscographyRecordType = "album" | "live" | "single" | "ep" | "compilation";

export interface DiscographyGroup {
  recordType: DiscographyRecordType;
  albums: ContentCardItem[];
}

export interface DiscographyProps {
  albums: ContentCardItem[];
  onSelectAlbum: (item: ContentCardItem) => void;
}
