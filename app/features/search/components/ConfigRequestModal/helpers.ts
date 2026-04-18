import { ContentType, type MusicItem, type MusicTrack, type MusicAlbum } from "@api/__generated__/types";

export function isAlbum(item: unknown): item is MusicAlbum {
  return !!item && typeof item === "object" && "type" in item && (item as MusicItem).type === ContentType.enum.album;
}

export function isTrack(item: unknown): item is MusicTrack {
  return (
    !!item &&
    typeof item === "object" &&
    "type" in item &&
    (item as MusicItem).type === ContentType.enum.track &&
    "album" in item
  );
}

export function isAnyTrack(item: unknown): item is MusicTrack {
  return isTrack(item);
}

function getDisplayName(item: MusicItem): string {
  if (item.type === ContentType.enum.track) return item.title;
  return item.name;
}

function getArtistName(item: MusicItem): string {
  if (item.type === ContentType.enum.artist) return item.name;
  if (item.type === ContentType.enum.playlist) return item.owner?.name || "Unknown";
  return item.artists?.[0]?.name || item.artist || "Unknown Artist";
}

export function getItemDisplayName(item: MusicItem | null): string {
  if (!item) return "";
  const name = getDisplayName(item);
  if (!name) return "";
  if (item.type === ContentType.enum.artist) return name;
  return `${getArtistName(item)} - ${name}`;
}

export function extractItemMetadata(item: MusicItem | null, parentAlbum?: MusicItem | null) {
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

  const name = getDisplayName(item);
  const artist = getArtistName(item);

  let image: string | undefined;
  let year: string | undefined;
  let totalTracks: number | undefined;
  let albumName: string | undefined;

  switch (item.type) {
    case ContentType.enum.album:
      image = item.images?.[0]?.url;
      year = item.release_date?.split("-")[0];
      totalTracks = item.total_tracks;
      break;
    case ContentType.enum.track:
      image = item.images?.[0]?.url || item.album.images?.[0]?.url;
      albumName = item.album.name;
      break;
    case ContentType.enum.playlist:
      image = item.images?.[0]?.url;
      totalTracks = item.total_tracks;
      break;
    case ContentType.enum.artist:
      image = item.images?.[0]?.url;
      break;
  }

  if (!image && parentAlbum && isAlbum(parentAlbum)) {
    image = parentAlbum.images?.[0]?.url;
    year = year || parentAlbum.release_date?.split("-")[0];
    albumName = albumName || parentAlbum.name;
  }

  return { name, artist, image, year, totalTracks, albumName };
}
