export const LINE_COUNT_OPTIONS = [
  { value: "200", label: "200" },
  { value: "500", label: "500" },
  { value: "1000", label: "1000" },
  { value: "2000", label: "2000" },
];

export const DEFAULT_LINE_COUNT = 500;

export const REFRESH_STORAGE_KEY = "synthseek.logs.refreshSeconds";
export const DEFAULT_REFRESH_SECONDS = "5";
export const REFRESH_INTERVAL_VALUES = ["0", "5", "10", "30", "60"] as const;

export const RECENT_EXPORT_FILENAME = "synthseek-recent.log";
export const ARCHIVE_FILENAME = "synthseek-logs.zip";
export const ARCHIVE_URL = "/api/v1/logs/archive";
