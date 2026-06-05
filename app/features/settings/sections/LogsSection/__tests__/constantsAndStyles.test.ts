import { describe, it, expect } from "vitest";

import {
  ARCHIVE_FILENAME,
  ARCHIVE_URL,
  DEFAULT_LINE_COUNT,
  DEFAULT_REFRESH_SECONDS,
  LINE_COUNT_OPTIONS,
  RECENT_EXPORT_FILENAME,
  REFRESH_INTERVAL_VALUES,
  REFRESH_STORAGE_KEY,
} from "../constants";
import {
  LOG_LEVEL_DEFAULT_CLASS,
  LOG_LEVEL_STYLES,
  exportActions,
  levelChips,
  logChip,
  logLine,
  logRequestId,
  logTerminal,
  searchWrap,
  selectorGroups,
  toolbarActions,
  viewerToolbar,
} from "../styles";

describe("LogsSection constants", () => {
  it("exposes the expected line count options", () => {
    expect(LINE_COUNT_OPTIONS.map((option) => option.value)).toEqual(["200", "500", "1000", "2000"]);
    expect(DEFAULT_LINE_COUNT).toBe(500);
  });

  it("exposes refresh and export constants", () => {
    expect(DEFAULT_REFRESH_SECONDS).toBe("5");
    expect(REFRESH_STORAGE_KEY).toContain("refreshSeconds");
    expect(REFRESH_INTERVAL_VALUES).toContain("60");
    expect(RECENT_EXPORT_FILENAME).toBe("synthseek-recent.log");
    expect(ARCHIVE_FILENAME).toBe("synthseek-logs.zip");
    expect(ARCHIVE_URL).toBe("/api/v1/logs/archive");
  });
});

describe("LogsSection styles", () => {
  it("returns base classes for static variants", () => {
    expect(viewerToolbar()).toContain("flex");
    expect(levelChips()).toContain("items-center");
    expect(searchWrap()).toContain("min-w-0");
    expect(selectorGroups()).toContain("flex-wrap");
    expect(toolbarActions()).toContain("items-center");
    expect(exportActions()).toContain("gap-3");
    expect(logTerminal()).toContain("font-mono");
    expect(logLine()).toContain("break-words");
    expect(logRequestId()).toContain("text-secondary-300");
  });

  it("maps logChip active variants", () => {
    expect(logChip({ active: true })).toContain("ring-fg/20");
    expect(logChip({ active: false })).toContain("opacity-40");
  });

  it("provides level color styles and a default", () => {
    expect(LOG_LEVEL_STYLES.ERROR).toBe("text-red-400");
    expect(LOG_LEVEL_STYLES.INFO).toBe("text-primary-300");
    expect(LOG_LEVEL_DEFAULT_CLASS).toBe("text-fg/70");
  });
});
