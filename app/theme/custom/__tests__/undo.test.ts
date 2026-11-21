// @vitest-environment node
import { describe, expect, it } from "vitest";

import { UNDO_GROUP_MS, UNDO_MAX_STEPS } from "../constants";
import { canRedo, canUndo, emptyUndoLog, recordSnapshot, redoStep, undoStep } from "../undo";
import type { UndoLog } from "../types";

function recorded(snapshots: [string, number][]): UndoLog {
  return snapshots.reduce((log, [snapshot, now]) => recordSnapshot(log, snapshot, now), emptyUndoLog());
}

describe("recordSnapshot", () => {
  it("only sets last on the first call", () => {
    const log = recordSnapshot(emptyUndoLog(), "a", 1000);
    expect(log).toEqual({ past: [], future: [], last: "a", at: 1000 });
    expect(canUndo(log)).toBe(false);
  });

  it("ignores an identical snapshot", () => {
    const log = recorded([
      ["a", 0],
      ["b", 5000],
    ]);
    expect(recordSnapshot(log, "b", 99999)).toBe(log);
  });

  it("turns the first edit into a step", () => {
    const log = recorded([
      ["a", 0],
      ["b", 10],
    ]);
    expect(log.past).toEqual(["a"]);
    expect(log.last).toBe("b");
  });

  it("groups two edits inside the window into one step", () => {
    const log = recorded([
      ["a", 0],
      ["b", 5000],
      ["c", 5000 + UNDO_GROUP_MS],
      ["d", 5000 + UNDO_GROUP_MS * 2],
    ]);
    expect(log.past).toEqual(["a"]);
    expect(log.last).toBe("d");
  });

  it("separates two edits that are further apart than the window", () => {
    const log = recorded([
      ["a", 0],
      ["b", 5000],
      ["c", 5000 + UNDO_GROUP_MS + 1],
    ]);
    expect(log.past).toEqual(["a", "b"]);
    expect(log.last).toBe("c");
  });

  it("measures the window from the latest edit, not the first", () => {
    const log = recorded([
      ["a", 0],
      ["b", 5000],
      ["c", 5700],
      ["d", 6400],
    ]);
    expect(log.past).toEqual(["a"]);
  });

  it("caps the past at the maximum and drops the oldest", () => {
    let log = recordSnapshot(emptyUndoLog(), "s0", 0);
    for (let index = 1; index <= UNDO_MAX_STEPS + 20; index += 1) {
      log = recordSnapshot(log, `s${index}`, index * 10000);
    }
    expect(log.past).toHaveLength(UNDO_MAX_STEPS);
    expect(log.past[0]).toBe("s20");
    expect(log.past[UNDO_MAX_STEPS - 1]).toBe(`s${UNDO_MAX_STEPS + 19}`);
  });

  it("clears the redo steps on a new edit", () => {
    const undone = undoStep(
      recorded([
        ["a", 0],
        ["b", 5000],
        ["c", 10000],
      ])
    );
    expect(undone && canRedo(undone.log)).toBe(true);
    const log = recordSnapshot(undone?.log ?? emptyUndoLog(), "z", 20000);
    expect(log.future).toEqual([]);
    expect(canRedo(log)).toBe(false);
  });
});

describe("undoStep and redoStep", () => {
  const log = recorded([
    ["a", 0],
    ["b", 5000],
    ["c", 10000],
  ]);

  it("has nothing to undo or redo on an empty log", () => {
    expect(undoStep(emptyUndoLog())).toBeNull();
    expect(redoStep(emptyUndoLog())).toBeNull();
    expect(canUndo(emptyUndoLog())).toBe(false);
    expect(canRedo(emptyUndoLog())).toBe(false);
  });

  it("steps back one snapshot and keeps the one left behind for redo", () => {
    const undone = undoStep(log);
    expect(undone?.snapshot).toBe("b");
    expect(undone?.log).toEqual({ past: ["a"], future: ["c"], last: "b", at: 0 });
  });

  it("steps forward again after an undo", () => {
    const undone = undoStep(log);
    const redone = undone ? redoStep(undone.log) : null;
    expect(redone?.snapshot).toBe("c");
    expect(redone?.log).toEqual({ past: ["a", "b"], future: [], last: "c", at: 0 });
  });

  it("walks the whole history in both directions", () => {
    const first = undoStep(log);
    const second = first ? undoStep(first.log) : null;
    expect(second?.snapshot).toBe("a");
    expect(second && undoStep(second.log)).toBeNull();
    const forward = second ? redoStep(second.log) : null;
    expect(forward?.snapshot).toBe("b");
    expect(forward && redoStep(forward.log)?.snapshot).toBe("c");
  });

  it("starts a new step for the next edit even right after the previous one", () => {
    const undone = undoStep(recordSnapshot(log, "d", 10000 + UNDO_GROUP_MS));
    expect(undone?.log.at).toBe(0);
    const edited = recordSnapshot(undone?.log ?? emptyUndoLog(), "x", 10000 + UNDO_GROUP_MS + 1);
    expect(edited.past).toEqual(["a", "b"]);
    expect(edited.last).toBe("x");
  });

  it("reports what is available through canUndo and canRedo", () => {
    const undone = undoStep(log);
    expect(canUndo(log)).toBe(true);
    expect(canRedo(log)).toBe(false);
    expect(undone && canRedo(undone.log)).toBe(true);
  });
});
