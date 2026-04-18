import { ContentType, type MusicItem } from "@api/__generated__/types";
import type { Result } from "./types";

function getDisplayName(item: MusicItem): string {
  if (item.type === ContentType.enum.track) return item.title || "Unknown";
  return item.name || "Unknown";
}

function getArtistName(item: MusicItem): string {
  if (item.type === ContentType.enum.artist) return item.name;
  if (item.type === ContentType.enum.playlist) return item.owner?.name || "Unknown";
  return item.artists?.[0]?.name || item.artist || "Unknown Artist";
}

export function transformResultForDisplay(item: MusicItem): Result {
  const type = item.type;
  const name = getDisplayName(item);
  const artistName = getArtistName(item);

  switch (type) {
    case ContentType.enum.track:
      return {
        id: item.id,
        type,
        name,
        artist: artistName,
        album: item.album.name,
        image: item.images?.[0]?.url || item.album.images?.[0]?.url,
      };
    case ContentType.enum.album:
      return {
        id: item.id,
        type,
        name,
        artist: artistName,
        image: item.images?.[0]?.url,
        year: item.release_date?.split("-")[0],
      };
    case ContentType.enum.artist:
      return {
        id: item.id,
        type,
        name,
        artist: name,
        image: item.images?.[0]?.url,
      };
    case ContentType.enum.playlist:
      return {
        id: item.id,
        type,
        name,
        artist: item.owner?.name || "Unknown",
        image: item.images?.[0]?.url,
        trackCount: item.total_tracks,
      };
  }
}

export function getSecondaryInfo(result: Result): string {
  switch (result.type) {
    case ContentType.enum.album:
      return [result.artist, result.year].filter(Boolean).join(" • ");
    case ContentType.enum.track:
      return [result.artist, result.album].filter(Boolean).join(" • ");
    case ContentType.enum.artist:
      return result.year || "";
    case ContentType.enum.playlist:
      return result.trackCount ? `${result.artist} · ${result.trackCount} tracks` : result.artist;
    default:
      return result.artist;
  }
}

export function getTypeBadgeLabel(type: ContentType): string {
  if (!type) return "Unknown";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function getTypeBadgeColors(type: ContentType): string {
  switch (type) {
    case ContentType.enum.album:
      return "bg-primary-500 border-primary-400 text-primary-foreground";
    case ContentType.enum.track:
      return "bg-accent-500 border-accent-400 text-accent-foreground";
    case ContentType.enum.artist:
      return "bg-secondary-500 border-secondary-400 text-secondary-foreground";
    case ContentType.enum.playlist:
      return "bg-emerald-500 border-emerald-400 text-emerald-50";
    default:
      return "bg-primary-500 border-primary-400 text-primary-foreground";
  }
}

export function transformPlaylistTrackForDisplay(playlistTrack: { track: MusicItem }): Result | null {
  const track = playlistTrack.track;
  if (!track) return null;

  if (track.type !== ContentType.enum.track) return null;

  return {
    id: track.id,
    type: ContentType.enum.track,
    name: track.title,
    artist: track.artists?.[0]?.name || track.artist || "Unknown Artist",
    album: track.album.name,
    image: track.images?.[0]?.url || track.album.images?.[0]?.url,
  };
}

export const MAX_RESULTS_DISPLAY = 12;
