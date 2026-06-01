import type { AvailabilityOption, BitrateOption, MatchingOption, QualityModeOption, UploadSpeedOption } from "./types";

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

export const QUALITY_MODE_OPTIONS: QualityModeOption[] = [
  { value: "standard", label: "Standard", description: "Pick bitrate and format" },
  { value: "lossless", label: "Lossless", description: "FLAC only, exact match" },
];

export const UPLOAD_SPEED_OPTIONS: UploadSpeedOption[] = [
  { value: 0, label: "Any", description: "No minimum" },
  { value: 102400, label: "100 KB/s", description: "Skip slow" },
  { value: 512000, label: "500 KB/s", description: "Fast" },
  { value: 1048576, label: "1 MB/s", description: "Fastest" },
];

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { value: "any", label: "Any peer", description: "Queue if busy" },
  { value: "free", label: "Available now", description: "Free slot only" },
];
