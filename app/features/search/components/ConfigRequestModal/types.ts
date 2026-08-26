import type { AppRouter, ContentType, MusicItem, MusicTrack } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { ParseKeys } from "i18next";
import type { ReactNode } from "react";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type DownloadSourceKey = NonNullable<RouterInputs["requests"]["batchRequest"]["config"]["sourceChain"]>[number];

export type AlbumDelegate = NonNullable<RouterInputs["requests"]["batchRequest"]["delegate"]>;

export type MonitorScope = AlbumDelegate["monitor"];

export type ArtistDelegateInput = RouterInputs["lidarr"]["delegateArtist"];

export type ArtistMonitorScope = ArtistDelegateInput["monitor"];

export type LidarrProfiles = RouterOutputs["lidarr"]["getProfiles"];

export type LidarrQualityProfile = LidarrProfiles["qualityProfiles"][number];

export type LidarrMetadataProfile = LidarrProfiles["metadataProfiles"][number];

export type LidarrRootFolder = LidarrProfiles["rootFolders"][number];

export type AcquisitionMode = "auto" | "manual" | "lidarr";

export interface AcquisitionSelection {
  mode: AcquisitionMode;
  order: DownloadSourceKey[];
  active: DownloadSourceKey[];
}

export interface AcquisitionOrderListProps {
  label: string;
  selection: AcquisitionSelection;
  lidarrAvailable: boolean;
  onChange: (selection: AcquisitionSelection) => void;
}

export interface EnabledDownloadSources {
  slskd: boolean;
  ytdlp: boolean;
  usenet: boolean;
}

export interface AcquisitionOptionContext {
  isAlbum: boolean;
  usenetAllowsSingleTracks: boolean;
}

export interface SourceRowLabels {
  labelKey: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export interface LidarrSelectionBase<M extends string> {
  rootFolderPath: string | undefined;
  qualityProfileId: number | undefined;
  metadataProfileId: number | undefined;
  monitor: M;
  tags: string[];
}

export type LidarrSelection = LidarrSelectionBase<MonitorScope>;

export type LidarrArtistSelection = LidarrSelectionBase<ArtistMonitorScope>;

export interface MonitorOption<M extends string> {
  value: M;
  labelKey: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export interface AlbumScopeChoice {
  value: "album" | "entireArtist";
  labelKey: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export type LidarrInputsProps =
  | {
      monitorMode: "album";
      value: LidarrSelection;
      onChange: (value: LidarrSelection) => void;
    }
  | {
      monitorMode: "artist";
      value: LidarrArtistSelection;
      onChange: (value: LidarrArtistSelection) => void;
    };

export interface LidarrProfileFieldsProps<M extends string> {
  value: LidarrSelectionBase<M>;
  onChange: (value: LidarrSelectionBase<M>) => void;
  monitorSlot: ReactNode;
}

export interface LidarrTagsInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
}

export interface LidarrSelectOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

export interface LidarrSelectProps<T extends string | number> {
  label: string;
  placeholder: string;
  options: LidarrSelectOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export type ArtistMonitorScopeOption = MonitorOption<ArtistMonitorScope>;

export type ConfigRequestMode = "download" | "lidarr-artist";

export interface ConfigRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MusicItem | null;
  itemType: ContentType;
  mode?: ConfigRequestMode;
  onSuccess?: (itemName: string) => void;
  parentAlbum?: MusicItem | null;
  preloadedTracks?: MusicTrack[];
}

export interface BitrateOption {
  value: number;
  label: string;
  descriptionKey: ParseKeys<"search">;
}

export interface MatchingOption {
  value: "strict" | "flexible";
  labelKey: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export type QualityMode = "standard" | "lossless";

export interface QualityModeOption {
  value: QualityMode;
  labelKey: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export interface UploadSpeedOption {
  value: number;
  label?: string;
  labelKey?: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export type AvailabilityMode = "any" | "free";

export interface AvailabilityOption {
  value: AvailabilityMode;
  labelKey: ParseKeys<"search">;
  descriptionKey: ParseKeys<"search">;
}

export interface ConfigHeaderProps {
  name: string;
  artist?: string;
  image?: string;
  year?: string;
  itemType: ContentType;
  totalTracks?: number;
  albumName?: string;
}

export interface Option<T extends string | number> {
  value: T;
  label: string;
  description: string;
}

export interface OptionGridProps<T extends string | number> {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 4;
  showCheckmark?: boolean;
  disabled?: boolean;
}
