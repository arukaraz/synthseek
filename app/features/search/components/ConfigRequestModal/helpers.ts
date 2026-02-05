import type { SpotifyItem } from "@api/__generated__/types";

export function isSpotifyAlbum(item: unknown): item is SpotifyApi.AlbumObjectSimplified {
  return (
    !!item &&
    typeof item === "object" &&
    "artists" in item &&
    Array.isArray((item as SpotifyApi.AlbumObjectSimplified).artists) &&
    "total_tracks" in item
  );
}

export function isSpotifyTrack(item: unknown): item is SpotifyApi.TrackObjectFull {
  return (
    !!item &&
    typeof item === "object" &&
    "artists" in item &&
    Array.isArray((item as SpotifyApi.TrackObjectFull).artists) &&
    "duration_ms" in item &&
    "album" in item
  );
}

export function isSpotifyTrackSimplified(item: unknown): item is SpotifyApi.TrackObjectSimplified {
  return (
    !!item &&
    typeof item === "object" &&
    "artists" in item &&
    Array.isArray((item as SpotifyApi.TrackObjectSimplified).artists) &&
    "duration_ms" in item &&
    !("album" in item)
  );
}

export function isAnySpotifyTrack(
  item: unknown
): item is SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified {
  return isSpotifyTrack(item) || isSpotifyTrackSimplified(item);
}

export function getItemDisplayName(item: SpotifyItem | null): string {
  if (!item) return "";

  if ("artists" in item && Array.isArray(item.artists)) {
    const artist = item.artists[0]?.name || "Unknown Artist";
    return `${artist} - ${item.name}`;
  }

  return item.name || "";
}

export function extractItemMetadata(item: SpotifyItem | null, parentAlbum?: SpotifyItem | null) {
  if (!item) {
    return {
      name: "",
      artist: undefined,
      image: undefined,
      year: undefined,
      totalTracks: undefined,
      albumName: undefined,
    };
  }

  const name = item.name;

  const artist =
    isSpotifyAlbum(item) || isAnySpotifyTrack(item) ? item.artists[0]?.name || "Unknown Artist" : undefined;

  let image: string | undefined;
  if (isSpotifyAlbum(item)) {
    image = item.images?.[0]?.url;
  } else if (isSpotifyTrack(item)) {
    image = item.album?.images?.[0]?.url;
  } else if (isSpotifyTrackSimplified(item) && parentAlbum && isSpotifyAlbum(parentAlbum)) {
    image = parentAlbum.images?.[0]?.url;
  }

  let year: string | undefined;
  if (isSpotifyAlbum(item)) {
    year = item.release_date?.slice(0, 4);
  } else if (isSpotifyTrack(item)) {
    year = item.album?.release_date?.slice(0, 4);
  } else if (isSpotifyTrackSimplified(item) && parentAlbum && isSpotifyAlbum(parentAlbum)) {
    year = parentAlbum.release_date?.slice(0, 4);
  }

  const totalTracks = isSpotifyAlbum(item) ? item.total_tracks : undefined;

  let albumName: string | undefined;
  if (isSpotifyTrack(item)) {
    albumName = item.album?.name;
  } else if (isSpotifyTrackSimplified(item) && parentAlbum && isSpotifyAlbum(parentAlbum)) {
    albumName = parentAlbum.name;
  }

  return { name, artist, image, year, totalTracks, albumName };
}
