import type { ContentType, MusicItem, MusicTrack } from "@api/__generated__/types";
import type { ParseKeys } from "i18next";

export interface ConfigRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MusicItem | null;
  itemType: ContentType;
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
