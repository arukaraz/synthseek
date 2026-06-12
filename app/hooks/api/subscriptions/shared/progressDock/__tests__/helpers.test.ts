import { describe, expect, it } from "vitest";

import { countDockItems, deriveTerminalStatus, terminalStatusFromCounts } from "../helpers";
import type { DockItem } from "../types";

function item(state: DockItem["state"]): DockItem {
  return { key: state, name: state, state };
}

describe("progressDock helpers", () => {
  describe("countDockItems", () => {
    it("counts done, skipped, and failed as separate buckets plus the total", () => {
      const counts = countDockItems([item("done"), item("skipped"), item("failed"), item("pending")]);
      expect(counts).toEqual({ done: 1, skipped: 1, failed: 1, total: 4 });
    });

    it("keeps skipped out of the done bucket", () => {
      const counts = countDockItems([item("done"), item("done"), item("skipped")]);
      expect(counts).toEqual({ done: 2, skipped: 1, failed: 0, total: 3 });
    });

    it("treats importing and pending as not yet resolved", () => {
      const counts = countDockItems([item("importing"), item("pending")]);
      expect(counts).toEqual({ done: 0, skipped: 0, failed: 0, total: 2 });
    });
  });

  describe("deriveTerminalStatus", () => {
    it("is complete when nothing failed", () => {
      expect(deriveTerminalStatus(5, 0)).toBe("complete");
    });

    it("is complete for an all-skipped job (zero resolved-as-done, zero failed)", () => {
      expect(deriveTerminalStatus(0, 0)).toBe("complete");
    });

    it("is failed when nothing resolved", () => {
      expect(deriveTerminalStatus(0, 3)).toBe("failed");
    });

    it("is partial when some resolved (including skipped) and some failed", () => {
      expect(deriveTerminalStatus(4, 2)).toBe("partial");
    });
  });

  it("terminalStatusFromCounts mirrors deriveTerminalStatus", () => {
    expect(terminalStatusFromCounts(3, 0)).toBe("complete");
    expect(terminalStatusFromCounts(0, 1)).toBe("failed");
    expect(terminalStatusFromCounts(2, 1)).toBe("partial");
  });
});
