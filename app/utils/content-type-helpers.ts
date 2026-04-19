import { ContentType } from "@api/__generated__/types";
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
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getContentTypeColor(type: ContentType): string {
  switch (type) {
    case ContentType.enum.track:
      return "text-accent-400";
    case ContentType.enum.album:
      return "text-primary-400";
    case ContentType.enum.playlist:
      return "text-emerald-400";
    case ContentType.enum.artist:
      return "text-secondary-400";
  }
}

export function getContentTypeBadgeColors(type: ContentType): string {
  switch (type) {
    case ContentType.enum.album:
      return "bg-primary-500 border-primary-400 text-primary-foreground";
    case ContentType.enum.track:
      return "bg-accent-500 border-accent-400 text-accent-foreground";
    case ContentType.enum.artist:
      return "bg-secondary-500 border-secondary-400 text-secondary-foreground";
    case ContentType.enum.playlist:
      return "bg-emerald-500 border-emerald-400 text-emerald-50";
  }
}
