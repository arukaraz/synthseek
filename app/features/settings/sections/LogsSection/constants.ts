import type { LogLevelSetting } from "./types";

export const LOGS_DESCRIPTION =
  "Recent server logs in the same format as the console. Filter by level, search, copy, or export.";

export const VIEWER_CARD_DESCRIPTION = "The most recent lines from the active log file.";

export const EXPORT_CARD_DESCRIPTION = "Bundle all server log files into a single zip.";

export const LINE_COUNT_OPTIONS = [
  { value: "200", label: "200" },
  { value: "500", label: "500" },
  { value: "1000", label: "1000" },
  { value: "2000", label: "2000" },
];

export const DEFAULT_LINE_COUNT = 500;

export const SEARCH_PLACEHOLDER = "Search logs";

export const REFRESH_STORAGE_KEY = "synthseek.logs.refreshSeconds";
export const DEFAULT_REFRESH_SECONDS = "5";
export const REFRESH_INTERVAL_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "5", label: "5s" },
  { value: "10", label: "10s" },
  { value: "30", label: "30s" },
  { value: "60", label: "60s" },
];

export const RECENT_EXPORT_FILENAME = "synthseek-recent.log";
export const ARCHIVE_FILENAME = "synthseek-logs.zip";
export const ARCHIVE_URL = "/api/v1/logs/archive";

export const LOG_LEVEL_CARD_DESCRIPTION = "Set logging verbosity level.";

export const LOG_LEVEL_OPTIONS: ReadonlyArray<{ value: LogLevelSetting; label: string }> = [
  { value: "DEBUG", label: "Debug" },
  { value: "INFO", label: "Info" },
  { value: "WARN", label: "Warn" },
  { value: "ERROR", label: "Error" },
];
