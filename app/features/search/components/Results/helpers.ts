import { ContentType } from "@api/__generated__/types";
import type { SpotifyItem } from "./types";
import type { Result } from "./types";

export function transformResultForDisplay(item: SpotifyItem): Result {
  switch (item.type) {
    case ContentType.enum.track: {
      const track = item as SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified;
      const album = "album" in track ? track.album : undefined;
      return {
        id: item.id,
        type: item.type,
        name: item.name,
        artist: item.artists[0]?.name || "Unknown Artist",
        album: album?.name,
        image: album?.images?.[0]?.url,
        year: album?.release_date?.split("-")[0],
      };
    }
    case ContentType.enum.album:
      return {
        id: item.id,
        type: item.type,
        name: item.name,
        artist: item.artists[0]?.name || "Unknown Artist",
        image: item.images[0]?.url,
        year: item.release_date?.split("-")[0],
      };
    case ContentType.enum.artist:
      return {
        id: item.id,
        type: item.type,
        name: item.name,
        artist: item.name,
        image: item.images?.[0]?.url,
      };
    case ContentType.enum.playlist:
      return {
        id: item.id,
        type: item.type,
        name: item.name,
        artist: item.owner.display_name || "Unknown",
        image: item.images[0]?.url,
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
      return result.artist;
    default:
      return result.artist;
  }
}

export function getTypeBadgeLabel(type: ContentType): string {
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

export function transformPlaylistTrackForDisplay(playlistTrack: SpotifyApi.PlaylistTrackObject): Result | null {
  const track = playlistTrack.track;
  if (!track || track.type !== ContentType.enum.track) return null;

  const fullTrack = track as SpotifyApi.TrackObjectFull;
  return {
    id: fullTrack.id,
    type: ContentType.enum.track,
    name: fullTrack.name,
    artist: fullTrack.artists[0]?.name || "Unknown Artist",
    album: fullTrack.album?.name,
    image: fullTrack.album?.images?.[0]?.url,
    year: fullTrack.album?.release_date?.split("-")[0],
  };
}

export const MAX_RESULTS_DISPLAY = 12;
