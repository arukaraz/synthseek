import type {
  AcquisitionMethodOption,
  ArtistMonitorScopeOption,
  AvailabilityOption,
  BitrateOption,
  MatchingOption,
  MonitorScopeOption,
  QualityModeOption,
  UploadSpeedOption,
} from "./types";

export const ACQUISITION_METHOD_OPTIONS: AcquisitionMethodOption[] = [
  {
    value: "auto",
    labelKey: "config.options.acquisition.auto.label",
    descriptionKey: "config.options.acquisition.auto.description",
    requires: [],
  },
  {
    value: "slskd",
    labelKey: "config.options.acquisition.slskd.label",
    descriptionKey: "config.options.acquisition.slskd.description",
    requires: ["slskd"],
  },
  {
    value: "ytdlp",
    labelKey: "config.options.acquisition.ytdlp.label",
    descriptionKey: "config.options.acquisition.ytdlp.description",
    requires: ["ytdlp"],
  },
  {
    value: "slskdThenYtdlp",
    labelKey: "config.options.acquisition.slskdThenYtdlp.label",
    descriptionKey: "config.options.acquisition.slskdThenYtdlp.description",
    requires: ["slskd", "ytdlp"],
  },
];

export const LIDARR_ACQUISITION_OPTION: AcquisitionMethodOption = {
  value: "lidarr",
  labelKey: "config.options.acquisition.lidarr.label",
  descriptionKey: "config.options.acquisition.lidarr.description",
  requires: [],
};

export const MONITOR_SCOPE_OPTIONS: MonitorScopeOption[] = [
  {
    value: "album",
    labelKey: "config.options.monitor.album.label",
    descriptionKey: "config.options.monitor.album.description",
  },
  {
    value: "artist",
    labelKey: "config.options.monitor.artist.label",
    descriptionKey: "config.options.monitor.artist.description",
  },
];

export const DEFAULT_MONITOR_SCOPE = "album" as const;

export const ARTIST_MONITOR_SCOPE_OPTIONS: ArtistMonitorScopeOption[] = [
  {
    value: "all",
    labelKey: "config.options.artistMonitor.all.label",
    descriptionKey: "config.options.artistMonitor.all.description",
  },
  {
    value: "future",
    labelKey: "config.options.artistMonitor.future.label",
    descriptionKey: "config.options.artistMonitor.future.description",
  },
  {
    value: "missing",
    labelKey: "config.options.artistMonitor.missing.label",
    descriptionKey: "config.options.artistMonitor.missing.description",
  },
  {
    value: "none",
    labelKey: "config.options.artistMonitor.none.label",
    descriptionKey: "config.options.artistMonitor.none.description",
  },
];

export const DEFAULT_ARTIST_MONITOR_SCOPE = "all" as const;

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
