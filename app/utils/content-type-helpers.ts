import { ContentType, type MusicItem } from "@api/__generated__/types";
import { capitalize } from "@utils/string";
import { Disc3, ListMusic, Music, type LucideIcon } from "lucide-react";

export function getContentTypeIcon(type: ContentType): LucideIcon {
  switch (type) {
    case ContentType.enum.track:
      return Music;
    case ContentType.enum.album:
      return Disc3;
    case ContentType.enum.playlist:
      return ListMusic;
    case ContentType.enum.artist:
      return Music;
  }
}

export function getContentTypeLabel(type: ContentType): string {
  return capitalize(type);
}

export function getMusicItemName(item: MusicItem): string {
  return item.type === ContentType.enum.track ? item.title : item.name;
}

export function getMusicItemArtist(item: MusicItem): string {
  if (item.type === ContentType.enum.artist) return item.name;
  if (item.type === ContentType.enum.playlist) return item.owner?.name || "Unknown";
  return item.artists?.[0]?.name || item.artist || "Unknown Artist";
}
