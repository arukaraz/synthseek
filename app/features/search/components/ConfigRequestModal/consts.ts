import type { AvailabilityOption, BitrateOption, MatchingOption, QualityModeOption, UploadSpeedOption } from "./types";

export const BITRATE_OPTIONS: BitrateOption[] = [
  { value: 320, label: "320 kbps", descriptionKey: "config.options.bitrate.best" },
  { value: 256, label: "256 kbps", descriptionKey: "config.options.bitrate.high" },
  { value: 192, label: "192 kbps", descriptionKey: "config.options.bitrate.good" },
  { value: 128, label: "128 kbps", descriptionKey: "config.options.bitrate.low" },
];

export const MATCHING_OPTIONS: MatchingOption[] = [
  {
    value: "strict",
    labelKey: "config.options.matching.strict.label",
    descriptionKey: "config.options.matching.strict.description",
  },
  {
    value: "flexible",
    labelKey: "config.options.matching.flexible.label",
    descriptionKey: "config.options.matching.flexible.description",
  },
];

export const QUALITY_MODE_OPTIONS: QualityModeOption[] = [
  {
    value: "standard",
    labelKey: "config.options.qualityMode.standard.label",
    descriptionKey: "config.options.qualityMode.standard.description",
  },
  {
    value: "lossless",
    labelKey: "config.options.qualityMode.lossless.label",
    descriptionKey: "config.options.qualityMode.lossless.description",
  },
];

export const UPLOAD_SPEED_OPTIONS: UploadSpeedOption[] = [
  {
    value: 0,
    labelKey: "config.options.uploadSpeed.any.label",
    descriptionKey: "config.options.uploadSpeed.any.description",
  },
  { value: 102400, label: "100 KB/s", descriptionKey: "config.options.uploadSpeed.kb100.description" },
  { value: 512000, label: "500 KB/s", descriptionKey: "config.options.uploadSpeed.kb500.description" },
  { value: 1048576, label: "1 MB/s", descriptionKey: "config.options.uploadSpeed.mb1.description" },
];

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  {
    value: "any",
    labelKey: "config.options.availability.any.label",
    descriptionKey: "config.options.availability.any.description",
  },
  {
    value: "free",
    labelKey: "config.options.availability.free.label",
    descriptionKey: "config.options.availability.free.description",
  },
];
