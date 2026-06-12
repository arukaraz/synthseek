import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import { buildSubtitle, ringStyle } from "../helpers";
import type { DockCounts } from "../types";

function counts(partial: Partial<DockCounts>): DockCounts {
  return { done: 0, skipped: 0, failed: 0, total: 0, ...partial };
}

const t = ((key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key) as unknown as TFunction<"appShell">;

describe("ProgressDock helpers", () => {
  describe("ringStyle", () => {
    it("fills the complete ring at ratio 1", () => {
      expect(ringStyle(1)).toEqual({ "--dock-ring-fill": "360deg" });
    });

    it("fills nothing at ratio 0", () => {
      expect(ringStyle(0)).toEqual({ "--dock-ring-fill": "0deg" });
    });

    it("fills half the ring at ratio 0.5", () => {
      expect(ringStyle(0.5)).toEqual({ "--dock-ring-fill": "180deg" });
    });
  });

  describe("buildSubtitle", () => {
    it("leads with the failed count when any item failed", () => {
      const subtitle = buildSubtitle(counts({ done: 1, failed: 2, total: 4 }), true, t);
      expect(subtitle.accent).toBe("2");
      expect(subtitle.accentTone).toBe("error");
      expect(subtitle.rest).toBe("progressDock.subtitle.failed");
    });

    it("shows the imported vs already-in-library breakdown on a terminal skipped job", () => {
      const subtitle = buildSubtitle(counts({ done: 2, skipped: 1, total: 3 }), true, t);
      expect(subtitle.accent).toBe("2");
      expect(subtitle.accentTone).toBe("sync");
      expect(subtitle.rest).toBe('progressDock.subtitle.skippedBreakdown:{"skipped":1}');
    });

    it("keeps the of-total form while running even with skipped items", () => {
      const subtitle = buildSubtitle(counts({ done: 2, skipped: 1, total: 4 }), false, t);
      expect(subtitle.rest).toBe('progressDock.subtitle.ofTotal:{"total":4}');
    });

    it("keeps the of-total form on a terminal job with no skips", () => {
      const subtitle = buildSubtitle(counts({ done: 3, total: 3 }), true, t);
      expect(subtitle.rest).toBe('progressDock.subtitle.ofTotal:{"total":3}');
    });
  });
});
