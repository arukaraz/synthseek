import type { BitrateOption, MatchingOption } from "./types";

export const BITRATE_OPTIONS: BitrateOption[] = [
  { value: 320, label: "320 kbps", description: "Best" },
  { value: 256, label: "256 kbps", description: "High" },
  { value: 192, label: "192 kbps", description: "Good" },
  { value: 128, label: "128 kbps", description: "Low" },
];

export const MATCHING_OPTIONS: MatchingOption[] = [
  { value: "strict", label: "Strict", description: "Exact match required" },
  { value: "flexible", label: "Flexible", description: "Best available match" },
];
