import { ContentType, type MusicAlbum, type MusicItem, type MusicTrack } from "@api/__generated__/types";
import { getMusicItemArtist, getMusicItemName } from "@utils/content-type-helpers";
import { ACQUISITION_METHOD_OPTIONS, LIDARR_ACQUISITION_OPTION } from "./consts";
import type {
  AcquisitionMethod,
  AcquisitionMethodOption,
  AcquisitionOptionContext,
  AlbumDelegate,
  ArtistDelegateInput,
  DownloadSourceKey,
  EnabledDownloadSources,
  LidarrArtistSelection,
  LidarrMetadataProfile,
  LidarrQualityProfile,
  LidarrRootFolder,
  LidarrSelectOption,
  LidarrSelection,
} from "./types";

const SOURCE_CHAIN_BY_METHOD: Record<AcquisitionMethod, DownloadSourceKey[]> = {
  auto: [],
  slskd: ["slskd"],
  ytdlp: ["ytdlp"],
  slskdThenYtdlp: ["slskd", "ytdlp"],
  lidarr: [],
};

export function buildSourceChain(
  method: AcquisitionMethod,
  enabledSources: EnabledDownloadSources
): DownloadSourceKey[] | undefined {
  const chain = SOURCE_CHAIN_BY_METHOD[method].filter((key) => enabledSources[key]);
  return chain.length > 0 ? chain : undefined;
}

export function getAvailableAcquisitionOptions(
  enabledSources: EnabledDownloadSources,
  context: AcquisitionOptionContext
): AcquisitionMethodOption[] {
  const chainOptions = ACQUISITION_METHOD_OPTIONS.filter((option) =>
    option.requires.every((key) => enabledSources[key])
  );
  if (context.isAlbum && context.lidarrAvailable) return [...chainOptions, LIDARR_ACQUISITION_OPTION];
  return chainOptions;
}

export function isAcquisitionMethod(value: string): value is AcquisitionMethod {
  if (value === LIDARR_ACQUISITION_OPTION.value) return true;
  return ACQUISITION_METHOD_OPTIONS.some((option) => option.value === value);
}

export function isLidarrMethod(method: AcquisitionMethod): boolean {
  return method === "lidarr";
}

export function showsSlskdControls(method: AcquisitionMethod): boolean {
  if (method === "lidarr") return false;
  if (method === "auto") return true;
  return SOURCE_CHAIN_BY_METHOD[method].includes("slskd");
}

export function allowsLossless(method: AcquisitionMethod): boolean {
  return showsSlskdControls(method);
}

export function isLidarrSelectionComplete(selection: {
  rootFolderPath: string | undefined;
  qualityProfileId: number | undefined;
  metadataProfileId: number | undefined;
}): boolean {
  return (
    selection.rootFolderPath !== undefined &&
    selection.qualityProfileId !== undefined &&
    selection.metadataProfileId !== undefined
  );
}

export function buildAlbumDelegate(selection: LidarrSelection): AlbumDelegate | undefined {
  if (
    selection.rootFolderPath === undefined ||
    selection.qualityProfileId === undefined ||
    selection.metadataProfileId === undefined
  ) {
    return undefined;
  }
  return {
    manager: "lidarr",
    rootFolderPath: selection.rootFolderPath,
    qualityProfileId: selection.qualityProfileId,
    metadataProfileId: selection.metadataProfileId,
    monitor: selection.monitor,
    tags: selection.tags,
  };
}

export function buildArtistDelegate(
  artistName: string,
  selection: LidarrArtistSelection,
  artistMbid?: string
): ArtistDelegateInput | undefined {
  if (
    selection.rootFolderPath === undefined ||
    selection.qualityProfileId === undefined ||
    selection.metadataProfileId === undefined
  ) {
    return undefined;
  }
  return {
    artistName,
    rootFolderPath: selection.rootFolderPath,
    qualityProfileId: selection.qualityProfileId,
    metadataProfileId: selection.metadataProfileId,
    monitor: selection.monitor,
    tags: selection.tags,
    ...(artistMbid ? { artistMbid } : {}),
  };
}

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

const BYTES_PER_GB = 1024 ** 3;

export function formatFreeSpace(freeSpace: number, suffix: string): string | undefined {
  if (!Number.isFinite(freeSpace) || freeSpace <= 0) return undefined;
  const gb = freeSpace / BYTES_PER_GB;
  const value = gb >= 100 ? Math.round(gb) : Math.round(gb * 10) / 10;
  return `${value} GB ${suffix}`;
}

export function buildRootFolderOptions(
  rootFolders: LidarrRootFolder[],
  freeSuffix: string
): LidarrSelectOption<string>[] {
  return rootFolders.map((folder) => ({
    value: folder.path,
    label: folder.path,
    description: formatFreeSpace(folder.freeSpace, freeSuffix),
  }));
}

export function buildQualityProfileOptions(profiles: LidarrQualityProfile[]): LidarrSelectOption<number>[] {
  return profiles.map((profile) => ({ value: profile.id, label: profile.name }));
}

export function normalizeTag(raw: string): string {
  return raw.trim();
}

export function hasTag(tags: string[], candidate: string): boolean {
  const target = candidate.toLowerCase();
  return tags.some((tag) => tag.toLowerCase() === target);
}

export function addTag(tags: string[], raw: string): string[] {
  const next = normalizeTag(raw);
  if (next.length === 0 || hasTag(tags, next)) return tags;
  return [...tags, next];
}

export function removeTag(tags: string[], target: string): string[] {
  return tags.filter((tag) => tag !== target);
}

export function filterTagSuggestions(suggestions: string[], selected: string[], query: string): string[] {
  const trimmed = query.trim().toLowerCase();
  return suggestions.filter((suggestion) => {
    if (hasTag(selected, suggestion)) return false;
    if (trimmed.length === 0) return true;
    return suggestion.toLowerCase().includes(trimmed);
  });
}

export function buildMetadataProfileOptions(profiles: LidarrMetadataProfile[]): LidarrSelectOption<number>[] {
  return profiles.map((profile) => ({ value: profile.id, label: profile.name }));
}
