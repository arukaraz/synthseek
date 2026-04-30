import { ContentType, type MusicAlbum, type MusicItem, type MusicTrack } from "@api/__generated__/types";
import { getMusicItemArtist, getMusicItemName } from "@utils/content-type-helpers";

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

export function getItemDisplayName(item: MusicItem | null): string {
  if (!item) return "";
  const name = getMusicItemName(item);
  if (!name) return "";
  if (item.type === ContentType.enum.artist) return name;
  return `${getMusicItemArtist(item)} - ${name}`;
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

  const name = getMusicItemName(item);
  const artist = getMusicItemArtist(item);

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

export function mapTrackFields(t: MusicTrack) {
  return {
    external_id: t.id,
    title: t.title,
    artist: getMusicItemArtist(t),
    track_number: t.track_number,
    disc_number: t.disc_number,
    duration_ms: t.duration_ms,
    explicit: t.explicit,
    isrc: t.isrc,
  };
}

