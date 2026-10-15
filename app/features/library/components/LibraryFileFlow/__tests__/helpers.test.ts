import { describe, expect, it, vi } from "vitest";

import type { LibraryFilesStatus } from "@hooks/api/queries/library/types";

import type { LibraryFileJob, LibraryFileTarget } from "../../../types";
import { deleteCopy, fileBulkActions, fileJobSummary, fileSelectionOf, jobPercent, moveTitle } from "../helpers";

const FINISHED: LibraryFilesStatus = {
  running: false,
  kind: "delete",
  targetPathId: null,
  total: 4,
  processed: 4,
  done: 4,
  failed: 0,
  startedAt: "2026-10-14T10:00:00.000Z",
  finishedAt: "2026-10-14T10:00:05.000Z",
  failures: [],
};

const DELETE_JOB: LibraryFileJob = { kind: "delete", baseline: null, since: 0, visible: true };
const MOVE_JOB: LibraryFileJob = { kind: "move", targetLabel: "Archive", baseline: null, since: 0, visible: true };

describe("fileSelectionOf", () => {
  it("sends album ids for an album and track ids for tracks", () => {
    expect(fileSelectionOf({ scope: "album", albumId: "alb-1", name: "Discovery", pathIds: [] })).toEqual({
      trackIds: [],
      albumIds: ["alb-1"],
    });
    expect(fileSelectionOf({ scope: "tracks", trackIds: ["a", "b"], pathIds: [] })).toEqual({
      trackIds: ["a", "b"],
      albumIds: [],
    });
    expect(fileSelectionOf({ scope: "track", trackId: "a", title: "A", pathIds: [] })).toEqual({
      trackIds: ["a"],
      albumIds: [],
    });
  });

  it("sends every selected album by album id", () => {
    expect(fileSelectionOf({ scope: "albums", albumIds: ["alb-1", "alb-2"], pathIds: ["music"] })).toEqual({
      trackIds: [],
      albumIds: ["alb-1", "alb-2"],
    });
  });
});

describe("moveTitle", () => {
  it("counts the albums of a bulk album move", () => {
    expect(moveTitle({ scope: "albums", albumIds: ["a", "b"], pathIds: [] })).toBe("Move 2 albums");
    expect(moveTitle({ scope: "albums", albumIds: ["a"], pathIds: [] })).toBe("Move 1 album");
  });
});

describe("fileBulkActions", () => {
  const target: LibraryFileTarget = { scope: "albums", albumIds: ["a", "b"], pathIds: ["music"] };

  it("offers move then delete with the eligible count, each opening the shared flow with the target", () => {
    const actions = { canMove: true, openMove: vi.fn(), openDelete: vi.fn() };
    const [move, remove] = fileBulkActions(target, 2, actions);

    expect(move?.label).toBe("Move to path…");
    expect(remove?.label).toBe("Delete files");
    expect(move?.count).toBe(2);

    move?.onClick();
    remove?.onClick();

    expect(actions.openMove).toHaveBeenCalledWith(target);
    expect(actions.openDelete).toHaveBeenCalledWith(target);
  });

  it("offers nothing when no selected item is in the library", () => {
    expect(fileBulkActions(target, 0, { canMove: true, openMove: vi.fn(), openDelete: vi.fn() })).toEqual([]);
  });

  it("leaves move out when the library has nowhere else to move to", () => {
    const actions = fileBulkActions(target, 2, { canMove: false, openMove: vi.fn(), openDelete: vi.fn() });

    expect(actions.map((action) => action.label)).toEqual(["Delete files"]);
  });
});

describe("deleteCopy", () => {
  it("names the album and speaks of files in the plural", () => {
    const copy = deleteCopy({ scope: "album", albumId: "alb-1", name: "Discovery", pathIds: [] });

    expect(copy.title).toBe("Delete the files of “Discovery”?");
    expect(copy.message).toBe(
      "The files move to the recycle bin and the songs leave the library and any playlist they are in."
    );
    expect(copy.confirm).toBe("Delete files");
  });

  it("counts a bulk selection, keeping the singular for one row", () => {
    expect(deleteCopy({ scope: "tracks", trackIds: ["a", "b"], pathIds: [] }).title).toBe("Delete 2 files?");
    expect(deleteCopy({ scope: "tracks", trackIds: ["a"], pathIds: [] }).confirm).toBe("Delete file");
  });

  it("counts the albums of a bulk album delete and speaks of files in the plural", () => {
    const copy = deleteCopy({ scope: "albums", albumIds: ["a", "b"], pathIds: [] });

    expect(copy.title).toBe("Delete the files of 2 albums?");
    expect(copy.confirm).toBe("Delete files");
  });
});

describe("fileJobSummary", () => {
  it("reports a clean delete as a success", () => {
    expect(fileJobSummary(DELETE_JOB, FINISHED)).toEqual({
      tone: "success",
      title: "4 songs went to the recycle bin",
    });
  });

  it("reports a partial move as a warning with what made it", () => {
    expect(fileJobSummary(MOVE_JOB, { ...FINISHED, kind: "move", done: 3, failed: 1 })).toEqual({
      tone: "warning",
      title: "Moved 3 of 4 songs to Archive",
    });
  });

  it("reports a move where nothing made it as an error", () => {
    expect(fileJobSummary(MOVE_JOB, { ...FINISHED, kind: "move", done: 0, failed: 4 })).toEqual({
      tone: "error",
      title: "No song was moved",
    });
  });
});

describe("jobPercent", () => {
  it("follows the processed share and starts at zero before the first answer", () => {
    expect(jobPercent(null)).toBe(0);
    expect(jobPercent({ ...FINISHED, running: true, processed: 1 })).toBe(25);
  });
});
