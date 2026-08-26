import { ContentType, type MusicAlbum, type MusicItem, type MusicTrack } from "@api/__generated__/types";
import { getMusicItemArtist, getMusicItemName } from "@utils/content-type-helpers";
import { SOURCE_PRIORITY_ORDER } from "./constants";
import type {
  AcquisitionOptionContext,
  AcquisitionSelection,
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

export function offeredSources(
  enabledSources: EnabledDownloadSources,
  context: AcquisitionOptionContext
): DownloadSourceKey[] {
  return SOURCE_PRIORITY_ORDER.filter((key) => {
    if (!enabledSources[key]) return false;
    if (key === "usenet") return context.isAlbum || context.usenetAllowsSingleTracks;
    return true;
  });
}

export function defaultSelection(offered: DownloadSourceKey[]): AcquisitionSelection {
  return { mode: "auto", order: [...offered], active: [...offered] };
}

export function reconcileSelection(
  selection: AcquisitionSelection,
  offered: DownloadSourceKey[],
  lidarrAvailable: boolean
): AcquisitionSelection {
  const order = [
    ...selection.order.filter((key) => offered.includes(key)),
    ...offered.filter((key) => !selection.order.includes(key)),
  ];
  const active = order.filter((key) => selection.active.includes(key) || !selection.order.includes(key));
  const mode = selection.mode === "lidarr" && !lidarrAvailable ? "auto" : selection.mode;
  return { mode, order, active };
}

export function moveSource(
  selection: AcquisitionSelection,
  key: DownloadSourceKey,
  direction: -1 | 1
): AcquisitionSelection {
  const index = selection.order.indexOf(key);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= selection.order.length) return selection;

  const order = [...selection.order];
  const [moved] = order.splice(index, 1);
  order.splice(target, 0, moved);
  return { ...selection, order };
}

export function isLastActiveSource(selection: AcquisitionSelection, key: DownloadSourceKey): boolean {
  return selection.active.length === 1 && selection.active[0] === key;
}

export function toggleSource(selection: AcquisitionSelection, key: DownloadSourceKey): AcquisitionSelection {
  if (isLastActiveSource(selection, key)) return selection;
  const active = selection.active.includes(key)
    ? selection.active.filter((entry) => entry !== key)
    : [...selection.active, key];
  return { ...selection, active };
}

export function buildSourceChain(selection: AcquisitionSelection): DownloadSourceKey[] | undefined {
  if (selection.mode !== "manual") return undefined;
  const chain = selection.order.filter((key) => selection.active.includes(key));
  return chain.length > 0 ? chain : undefined;
}

export function isLidarrSelected(selection: AcquisitionSelection): boolean {
  return selection.mode === "lidarr";
}

export function usesSlskd(selection: AcquisitionSelection): boolean {
  if (selection.mode === "lidarr") return false;
  if (selection.mode === "auto") return true;
  return selection.order.some((key) => key === "slskd" && selection.active.includes(key));
}

export function allowsLossless(selection: AcquisitionSelection): boolean {
  return usesSlskd(selection);
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
  if (item.type === ContentType.enum.artist || item.type === ContentType.enum.playlist) return name;
  const artist = item.artists?.[0]?.name || item.artist;
  return artist ? `${artist} - ${name}` : name;
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
