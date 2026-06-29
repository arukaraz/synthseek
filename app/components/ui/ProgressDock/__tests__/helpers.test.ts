import type { TFunction } from "i18next";
import { CheckCircle, XCircle } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  buildRequestSubtitle,
  buildSubtitle,
  controlsFor,
  presentationFor,
  ringStyle,
  statusIconGlyph,
  titleKey,
} from "../helpers";
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

  describe("presentationFor", () => {
    it("derives a ring for the three existing kinds", () => {
      expect(presentationFor("plex-sync", "running", 0.5, 50)).toEqual({ indicator: "ring", ratio: 0.5, percent: 50 });
      expect(presentationFor("library-import", "complete", 1, 100)).toEqual({
        indicator: "ring",
        ratio: 1,
        percent: 100,
      });
      expect(presentationFor("file-import", "failed", 0.2, 20)).toEqual({ indicator: "ring", ratio: 0.2, percent: 20 });
    });

    it("derives a spinner for a running request and a status icon once terminal", () => {
      expect(presentationFor("request", "running", 0, 0)).toEqual({ indicator: "spinner" });
      expect(presentationFor("request", "complete", 0, 0)).toEqual({ indicator: "status-icon", status: "complete" });
      expect(presentationFor("request", "failed", 0, 0)).toEqual({ indicator: "status-icon", status: "failed" });
      expect(presentationFor("request", "partial", 0, 0)).toEqual({ indicator: "status-icon", status: "partial" });
    });
  });

  describe("controlsFor", () => {
    it("keeps toggle and close for the three existing kinds", () => {
      expect(controlsFor("plex-sync", "running")).toEqual({ toggle: true, close: true });
      expect(controlsFor("library-import", "complete")).toEqual({ toggle: true, close: true });
    });

    it("hides every control while a request runs and shows only close once terminal", () => {
      expect(controlsFor("request", "running")).toEqual({ toggle: false, close: false });
      expect(controlsFor("request", "complete")).toEqual({ toggle: false, close: true });
      expect(controlsFor("request", "failed")).toEqual({ toggle: false, close: true });
    });
  });

  describe("statusIconGlyph", () => {
    it("maps failed to the X glyph and every other terminal status to the check glyph", () => {
      expect(statusIconGlyph("failed")).toBe(XCircle);
      expect(statusIconGlyph("complete")).toBe(CheckCircle);
      expect(statusIconGlyph("partial")).toBe(CheckCircle);
    });
  });

  describe("buildRequestSubtitle", () => {
    it("uses the short processing copy at or below the long-run threshold while running", () => {
      const subtitle = buildRequestSubtitle("running", 40, t);
      expect(subtitle.accent).toBe("");
      expect(subtitle.rest).toBe('progressDock.subtitle.processingTracks:{"count":40}');
    });

    it("uses the long-run processing copy above the threshold while running", () => {
      const subtitle = buildRequestSubtitle("running", 41, t);
      expect(subtitle.rest).toBe('progressDock.subtitle.processingTracksLong:{"count":41}');
    });

    it("pluralizes the running copy correctly for a single track", () => {
      const subtitle = buildRequestSubtitle("running", 1, t);
      expect(subtitle.rest).toBe('progressDock.subtitle.processingTracks:{"count":1}');
    });

    it("shows the queued-tracks count on a complete request, never the done-of-total form", () => {
      const subtitle = buildRequestSubtitle("complete", 71, t);
      expect(subtitle.accent).toBe("");
      expect(subtitle.accentTone).toBe("sync");
      expect(subtitle.rest).toBe('progressDock.subtitle.requestComplete:{"count":71}');
    });

    it("pluralizes the complete copy for a single track", () => {
      const subtitle = buildRequestSubtitle("complete", 1, t);
      expect(subtitle.rest).toBe('progressDock.subtitle.requestComplete:{"count":1}');
    });

    it("shows the unavailable copy on a partial request", () => {
      const subtitle = buildRequestSubtitle("partial", 71, t);
      expect(subtitle.accentTone).toBe("sync");
      expect(subtitle.rest).toBe("progressDock.subtitle.requestPartial");
    });

    it("shows the failed copy with an error tone on a failed request", () => {
      const subtitle = buildRequestSubtitle("failed", 71, t);
      expect(subtitle.accentTone).toBe("error");
      expect(subtitle.rest).toBe("progressDock.subtitle.requestFailed");
    });
  });

  describe("titleKey", () => {
    it("uses the queueing title while a request runs", () => {
      expect(titleKey("request", "running")).toBe("progressDock.title.queueing");
    });

    it("uses the queued title for a complete or partial request", () => {
      expect(titleKey("request", "complete")).toBe("progressDock.title.queued");
      expect(titleKey("request", "partial")).toBe("progressDock.title.queued");
    });

    it("uses the queue-failed title for a failed request", () => {
      expect(titleKey("request", "failed")).toBe("progressDock.title.queueFailed");
    });

    it("leaves the existing kinds' titles unchanged", () => {
      expect(titleKey("plex-sync", "running")).toBe("progressDock.title.plexSyncRunning");
      expect(titleKey("plex-sync", "complete")).toBe("progressDock.title.plexSyncDone");
      expect(titleKey("library-import", "running")).toBe("progressDock.title.libraryImportRunning");
      expect(titleKey("library-import", "complete")).toBe("progressDock.title.libraryImportDone");
      expect(titleKey("file-import", "running")).toBe("progressDock.title.fileImportRunning");
      expect(titleKey("file-import", "complete")).toBe("progressDock.title.fileImportDone");
    });
  });
});
