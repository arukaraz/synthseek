import {
  ContentType,
  FORMAT_OPTIONS,
  RequestFormat,
  RequestMatchingMode,
  type MusicAlbum,
  type MusicItem,
  type MusicPlaylistTrack,
  type MusicTrack,
} from "@api/__generated__/types";
import { getMusicItemArtist, getMusicItemName } from "@utils/content-type-helpers";
import { matchesTerms, searchTerms } from "@utils/search";
import type { TFunction } from "i18next";
import {
  AVAILABILITY_OPTIONS,
  MATCHING_LABEL_KEYS,
  SOURCE_PRIORITY_ORDER,
  SOURCE_ROW_LABELS,
  UPLOAD_SPEED_OPTIONS,
} from "./constants";
import type {
  AcquisitionSelection,
  AlbumDelegate,
  ArtistDelegateInput,
  CatalogContentEntry,
  CatalogContents,
  CatalogEntryView,
  ConfigRequestMode,
  DestinationPreview,
  DestinationRequest,
  DownloadSourceKey,
  DownloadSourcesAvailability,
  LidarrArtistSelection,
  LidarrMetadataProfile,
  LidarrQualityProfile,
  LidarrRootFolder,
  LidarrProfiles,
  LidarrSelectOption,
  LidarrSelection,
  LidarrSelectionBase,
  QualityMode,
  RecipeDestination,
  RecipeRowKey,
  RequestPreset,
  RequestSelection,
  RestorableRowKey,
} from "./types";

export function offeredSources(
  availability: DownloadSourcesAvailability | undefined,
  isAlbum: boolean
): DownloadSourceKey[] {
  if (availability === undefined) return [];
  return SOURCE_PRIORITY_ORDER.filter(
    (key) => availability[key].enabled && (isAlbum || availability[key].allowsSingleTracks)
  );
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

export function acquisitionFromChain(
  chain: DownloadSourceKey[] | undefined,
  offered: DownloadSourceKey[]
): AcquisitionSelection {
  if (!chain) return defaultSelection(offered);
  const active = chain.filter((key) => offered.includes(key));
  if (active.length === 0) return defaultSelection(offered);
  return { mode: "manual", order: [...active, ...offered.filter((key) => !active.includes(key))], active };
}

export function selectionFromPreset(preset: RequestPreset, offered: DownloadSourceKey[]): RequestSelection {
  const acquisition = acquisitionFromChain(preset.sourceChain, offered);
  const lossless = preset.format.value === RequestFormat.enum.flac && allowsLossless(acquisition);
  return {
    qualityMode: lossless ? "lossless" : "standard",
    bitrate: preset.bitrate.value,
    format: preset.format.value,
    bitrateMatching: preset.bitrate.matching,
    formatMatching: preset.format.matching,
    minUploadSpeed: preset.minUploadSpeed,
    availability: preset.requireFreeSlot ? "free" : "any",
    acquisition,
  };
}

function formatLabel(format: RequestFormat): string {
  return FORMAT_OPTIONS.find((option) => option.value === format)?.label ?? format;
}

export function describeSourceChain(chain: DownloadSourceKey[] | undefined, t: TFunction<"search">): string {
  return chain
    ? chain.map((key) => t(SOURCE_ROW_LABELS[key].labelKey)).join(" → ")
    : t("config.options.acquisition.auto.label");
}

export function summarizePreset(preset: RequestPreset, t: TFunction<"search">): string {
  const matching = t(MATCHING_LABEL_KEYS[preset.format.matching]);
  const quality =
    preset.format.value === RequestFormat.enum.flac
      ? `${t("config.options.qualityMode.lossless.label")} (${matching})`
      : `${formatLabel(preset.format.value)} ${preset.bitrate.value} kbps (${matching})`;
  return `${quality} · ${describeSourceChain(preset.sourceChain, t)}`;
}

export function isLosslessActive(selection: RequestSelection): boolean {
  return selection.qualityMode === "lossless" && allowsLossless(selection.acquisition);
}

function sentFormat(selection: RequestSelection): RequestFormat {
  return isLosslessActive(selection) ? RequestFormat.enum.flac : selection.format;
}

export function describeSource(selection: AcquisitionSelection, t: TFunction<"search">): string {
  if (selection.mode === "lidarr") return t("config.options.acquisition.lidarr.label");
  return describeSourceChain(buildSourceChain(selection), t);
}

export function describeQuality(selection: RequestSelection, t: TFunction<"search">): string {
  if (isLosslessActive(selection)) {
    return `${t("config.options.qualityMode.lossless.label")} (${t(MATCHING_LABEL_KEYS[selection.formatMatching])})`;
  }
  return `${formatLabel(selection.format)} ${selection.bitrate} kbps`;
}

export function summarizeSelection(selection: RequestSelection, t: TFunction<"search">): string {
  return `${describeQuality(selection, t)} · ${describeSource(selection.acquisition, t)}`;
}

export function describeMatching(selection: RequestSelection, t: TFunction<"search">): string {
  if (selection.bitrateMatching === selection.formatMatching) return t(MATCHING_LABEL_KEYS[selection.bitrateMatching]);
  return t("config.preset.matchingMixed", {
    bitrate: t(MATCHING_LABEL_KEYS[selection.bitrateMatching]),
    format: t(MATCHING_LABEL_KEYS[selection.formatMatching]),
  });
}

export function describeUploadSpeed(speed: number, t: TFunction<"search">): string {
  const option = UPLOAD_SPEED_OPTIONS.find((entry) => entry.value === speed);
  if (option?.labelKey) return t(option.labelKey);
  return option?.label ?? `${Math.round(speed / 1024)} KB/s`;
}

export function describePeers(selection: RequestSelection, t: TFunction<"search">): string {
  const availability = AVAILABILITY_OPTIONS.find((option) => option.value === selection.availability);
  const speed = describeUploadSpeed(selection.minUploadSpeed, t);
  return availability ? `${speed} · ${t(availability.labelKey)}` : speed;
}

export function chosenDestinationId(preview: DestinationPreview, value: string | null): string {
  return preview.lock !== null ? preview.pathId : (value ?? preview.pathId);
}

export function describeDestination(preview: DestinationPreview, value: string | null): string {
  const id = chosenDestinationId(preview, value);
  return preview.paths.find((path) => path.id === id)?.label ?? "";
}

export function describeLidarr(
  selection: LidarrSelectionBase<string>,
  profiles: LidarrProfiles | undefined,
  t: TFunction<"search">
): string {
  const profile = profiles?.qualityProfiles.find((entry) => entry.id === selection.qualityProfileId)?.name;
  return [t("config.options.acquisition.lidarr.label"), profile, selection.rootFolderPath]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" · ");
}

function sameChain(left: DownloadSourceKey[], right: DownloadSourceKey[]): boolean {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function sameAcquisition(left: AcquisitionSelection, right: AcquisitionSelection): boolean {
  if (left.mode !== right.mode) return false;
  if (left.mode !== "manual") return true;
  return sameChain(buildSourceChain(left) ?? [], buildSourceChain(right) ?? []);
}

export function recipeRows(selection: RequestSelection, hasDestination: boolean): RecipeRowKey[] {
  if (isLidarrSelected(selection.acquisition)) return ["source"];
  const rows: RecipeRowKey[] = ["source", "quality"];
  if (usesSlskd(selection.acquisition)) {
    if (!isLosslessActive(selection)) rows.push("matching");
    rows.push("peer");
  }
  if (hasDestination) rows.push("destination");
  return rows;
}

export function isRowChanged(
  key: RecipeRowKey,
  selection: RequestSelection,
  base: RequestSelection,
  destinationPathId: string | null
): boolean {
  switch (key) {
    case "source":
      return !sameAcquisition(selection.acquisition, base.acquisition);
    case "quality": {
      if (sentFormat(selection) !== sentFormat(base) || selection.bitrate !== base.bitrate) return true;
      if (!isLosslessActive(selection)) return false;
      return selection.formatMatching !== base.formatMatching || selection.bitrateMatching !== base.bitrateMatching;
    }
    case "matching":
      return selection.bitrateMatching !== base.bitrateMatching || selection.formatMatching !== base.formatMatching;
    case "peer":
      return selection.minUploadSpeed !== base.minUploadSpeed || selection.availability !== base.availability;
    case "destination":
      return destinationPathId !== null;
  }
}

export function changedRecipeRows(
  selection: RequestSelection,
  base: RequestSelection,
  hasDestination: boolean,
  destinationPathId: string | null
): RecipeRowKey[] {
  return recipeRows(selection, hasDestination).filter((key) => isRowChanged(key, selection, base, destinationPathId));
}

export function describeRow(
  key: RecipeRowKey,
  selection: RequestSelection,
  destination: RecipeDestination | null,
  t: TFunction<"search">
): string {
  switch (key) {
    case "source":
      return describeSource(selection.acquisition, t);
    case "quality":
      return describeQuality(selection, t);
    case "matching":
      return describeMatching(selection, t);
    case "peer":
      return describePeers(selection, t);
    case "destination":
      return destination ? describeDestination(destination.preview, destination.value) : "";
  }
}

export function restoreRow(
  key: RestorableRowKey,
  selection: RequestSelection,
  base: RequestSelection
): RequestSelection {
  switch (key) {
    case "source":
      return { ...selection, acquisition: base.acquisition };
    case "quality": {
      const quality = { ...selection, qualityMode: base.qualityMode, format: base.format, bitrate: base.bitrate };
      if (!isLosslessActive(selection) && !isLosslessActive(base)) return quality;
      return { ...quality, bitrateMatching: base.bitrateMatching, formatMatching: base.formatMatching };
    }
    case "matching":
      return { ...selection, bitrateMatching: base.bitrateMatching, formatMatching: base.formatMatching };
    case "peer":
      return { ...selection, minUploadSpeed: base.minUploadSpeed, availability: base.availability };
  }
}

export function withQualityMode(selection: RequestSelection, qualityMode: QualityMode): RequestSelection {
  if (qualityMode === selection.qualityMode) return selection;
  if (qualityMode === "lossless") return { ...selection, qualityMode, formatMatching: RequestMatchingMode.enum.strict };
  return { ...selection, qualityMode };
}

export function presetFromSelection(selection: RequestSelection): RequestPreset {
  const sourceChain = buildSourceChain(selection.acquisition);
  return {
    bitrate: { value: selection.bitrate, matching: selection.bitrateMatching },
    format: { value: sentFormat(selection), matching: selection.formatMatching },
    minUploadSpeed: selection.minUploadSpeed,
    requireFreeSlot: selection.availability === "free",
    ...(sourceChain ? { sourceChain } : {}),
  };
}

function isPlaylistEntry(entry: CatalogContentEntry): entry is MusicPlaylistTrack {
  const view: CatalogEntryView = entry;
  return typeof view.track === "object" && view.track !== null;
}

function trackOfEntry(entry: CatalogContentEntry): MusicTrack | null {
  if (isPlaylistEntry(entry)) return entry.track;
  return entry.type === ContentType.enum.track ? entry : null;
}

export function tracksFromContents(response: CatalogContents | undefined): MusicTrack[] {
  if (!response?.success) return [];
  return response.content.flatMap((entry) => {
    const track = trackOfEntry(entry);
    return track ? [track] : [];
  });
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
    credited_artist: getMusicItemArtist(t),
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
  const terms = searchTerms(query);
  return suggestions.filter((suggestion) => {
    if (hasTag(selected, suggestion)) return false;
    return matchesTerms(terms, [suggestion]);
  });
}

export function destinationRequestFor(
  item: MusicItem | null,
  parentAlbum: MusicItem | null | undefined,
  format: RequestFormat,
  mode: ConfigRequestMode
): DestinationRequest | null {
  if (item === null || mode !== "download") return null;
  if (item.type === ContentType.enum.album) {
    return { albumExternalId: item.id, format, requestType: ContentType.enum.album };
  }
  if (item.type === ContentType.enum.track) {
    return { albumExternalId: parentAlbum?.id ?? item.album.id, format, requestType: ContentType.enum.track };
  }
  return null;
}

export function destinationOptions(preview: DestinationPreview): LidarrSelectOption<string>[] {
  return preview.paths
    .filter((path) => path.accepts || path.id === preview.pathId)
    .map((path) => ({ value: path.id, label: path.label }));
}

export function destinationLabel(preview: DestinationPreview): string {
  return preview.paths.find((path) => path.id === preview.pathId)?.label ?? "";
}

export function buildMetadataProfileOptions(profiles: LidarrMetadataProfile[]): LidarrSelectOption<number>[] {
  return profiles.map((profile) => ({ value: profile.id, label: profile.name }));
}
