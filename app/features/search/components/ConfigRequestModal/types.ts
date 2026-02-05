import type { ContentType } from "@api/__generated__/types";
import type { SpotifyItem } from "@api/__generated__/types";

export interface ConfigRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SpotifyItem | null;
  itemType: ContentType;
  onSuccess?: (itemName: string) => void;
  parentAlbum?: SpotifyItem | null;
}

export interface BitrateOption {
  value: number;
  label: string;
  description: string;
}

export const BITRATE_OPTIONS: BitrateOption[] = [
  { value: 320, label: "320 kbps", description: "Best" },
  { value: 256, label: "256 kbps", description: "High" },
  { value: 192, label: "192 kbps", description: "Good" },
  { value: 128, label: "128 kbps", description: "Low" },
];

export interface MatchingOption {
  value: "strict" | "flexible";
  label: string;
  description: string;
}

export const MATCHING_OPTIONS: MatchingOption[] = [
  { value: "strict", label: "Strict", description: "Exact match required" },
  { value: "flexible", label: "Flexible", description: "Best available match" },
];
