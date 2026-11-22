import { RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { describe, expect, it } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import {
  availableBulkActions,
  bulkActionTargets,
  countTrackGroups,
  hasMultipleDiscs,
  idsOfStatus,
  nextTrackSort,
  orderTracks,
  presentTrackGroups,
  toTrackSortKey,
  trackActionsFor,
  trackNumberLabel,
} from "../helpers";
import type { TrackActionPermissions, TrackGroup } from "../types";

const manager: TrackActionPermissions = { canManage: true, isAdmin: false };
const admin: TrackActionPermissions = { canManage: true, isAdmin: true };
const viewer: TrackActionPermissions = { canManage: false, isAdmin: false };

const noFilter: ReadonlySet<TrackGroup> = new Set();
const ids = (tracks: TrackRequest[]) => tracks.map((track) => track.id);

describe("countTrackGroups and presentTrackGroups", () => {
  it("counts cancelled tracks apart from failed ones", () => {
    const counts = countTrackGroups([
      makeRequestsTrack({ status: RequestStatus.enum.complete }),
      makeRequestsTrack({ status: RequestStatus.enum.downloading }),
      makeRequestsTrack({ status: RequestStatus.enum.queued }),
      makeRequestsTrack({ status: RequestStatus.enum.pending_approval }),
      makeRequestsTrack({ status: RequestStatus.enum.failed }),
      makeRequestsTrack({ status: RequestStatus.enum.cancelled }),
      makeRequestsTrack({ status: RequestStatus.enum.cancelled }),
    ]);

    expect(counts).toEqual({ done: 1, active: 2, review: 1, failed: 1, cancelled: 2 });
  });

  it("lists only the groups that hold a track, in a fixed order", () => {
    expect(presentTrackGroups({ done: 0, active: 3, review: 0, failed: 1, cancelled: 0 })).toEqual([
      "active",
      "failed",
    ]);
  });
});

describe("nextTrackSort", () => {
  it("cycles a column through ascending, descending and back to the canonical order", () => {
    const first = nextTrackSort(null, "title");
    const second = nextTrackSort(first, "title");
    const third = nextTrackSort(second, "title");

    expect(first).toEqual({ key: "title", direction: "asc" });
    expect(second).toEqual({ key: "title", direction: "desc" });
    expect(third).toBeNull();
  });

  it("starts a different column ascending", () => {
    expect(nextTrackSort({ key: "title", direction: "desc" }, "artist")).toEqual({ key: "artist", direction: "asc" });
  });
});

describe("toTrackSortKey", () => {
  it("accepts a sortable column and refuses anything else", () => {
    expect(toTrackSortKey("completed")).toBe("completed");
    expect(toTrackSortKey("actions")).toBeNull();
  });
});

describe("track numbers and discs", () => {
  it("sees more than one disc only when the numbers differ", () => {
    expect(hasMultipleDiscs([makeRequestsTrack({ disc_number: 1 }), makeRequestsTrack({ disc_number: 1 })])).toBe(
      false
    );
    expect(hasMultipleDiscs([makeRequestsTrack({ disc_number: 1 }), makeRequestsTrack({ disc_number: 2 })])).toBe(true);
  });

  it("numbers a playlist by position and an album by its track number, with the disc when asked", () => {
    const track = makeRequestsTrack({ disc_number: 2, track_number: 7 });

    expect(trackNumberLabel(track, 3, false, false)).toBe("3");
    expect(trackNumberLabel(track, 3, true, false)).toBe("7");
    expect(trackNumberLabel(track, 3, true, true)).toBe("2.7");
  });
});

describe("orderTracks", () => {
  const tracks = [
    makeRequestsTrack({ id: "a", title: "Charlie", status: RequestStatus.enum.failed }),
    makeRequestsTrack({ id: "b", title: "alpha", status: RequestStatus.enum.complete }),
    makeRequestsTrack({ id: "c", title: "Bravo", status: RequestStatus.enum.cancelled }),
    makeRequestsTrack({ id: "d", title: "Delta", status: RequestStatus.enum.complete }),
  ];

  it("keeps the order it was given when nothing is sorted or filtered", () => {
    expect(ids(orderTracks(tracks, noFilter, null))).toEqual(["a", "b", "c", "d"]);
  });

  it("does not reorder the array it was given", () => {
    orderTracks(tracks, noFilter, { key: "title", direction: "asc" });

    expect(ids(tracks)).toEqual(["a", "b", "c", "d"]);
  });

  it("sorts titles without regard to case, both ways", () => {
    expect(ids(orderTracks(tracks, noFilter, { key: "title", direction: "asc" }))).toEqual(["b", "c", "a", "d"]);
    expect(ids(orderTracks(tracks, noFilter, { key: "title", direction: "desc" }))).toEqual(["d", "a", "c", "b"]);
  });

  it("keeps only the groups in the filter, in their original order", () => {
    expect(ids(orderTracks(tracks, new Set<TrackGroup>(["done", "cancelled"]), null))).toEqual(["b", "c", "d"]);
  });

  it("breaks a tie by the original position, whichever way the sort runs", () => {
    const tied = [
      makeRequestsTrack({ id: "x", credited_artist: "Same" }),
      makeRequestsTrack({ id: "y", credited_artist: "Same" }),
    ];

    expect(ids(orderTracks(tied, noFilter, { key: "artist", direction: "desc" }))).toEqual(["x", "y"]);
  });

  it("puts a track with no completion date last, in either direction", () => {
    const dated = [
      makeRequestsTrack({ id: "none", completed_at: null }),
      makeRequestsTrack({ id: "early", completed_at: new Date("2026-01-01") }),
      makeRequestsTrack({ id: "late", completed_at: new Date("2026-06-01") }),
    ];

    expect(ids(orderTracks(dated, noFilter, { key: "completed", direction: "asc" }))).toEqual([
      "early",
      "late",
      "none",
    ]);
    expect(ids(orderTracks(dated, noFilter, { key: "completed", direction: "desc" }))).toEqual([
      "late",
      "early",
      "none",
    ]);
  });

  it("puts a track with no source last", () => {
    const sourced = [
      makeRequestsTrack({ id: "none", acquisition_source: null }),
      makeRequestsTrack({ id: "slskd", acquisition_source: "slskd" }),
      makeRequestsTrack({ id: "archive", acquisition_source: "archive" }),
    ];

    expect(ids(orderTracks(sourced, noFilter, { key: "source", direction: "asc" }))).toEqual([
      "archive",
      "slskd",
      "none",
    ]);
  });

  it("orders failed tracks by when they try again within the status sort", () => {
    const failed = [
      makeRequestsTrack({ id: "later", status: RequestStatus.enum.failed, next_retry_at: new Date("2026-12-02") }),
      makeRequestsTrack({ id: "never", status: RequestStatus.enum.failed, next_retry_at: null }),
      makeRequestsTrack({ id: "sooner", status: RequestStatus.enum.failed, next_retry_at: new Date("2026-12-01") }),
    ];

    expect(ids(orderTracks(failed, noFilter, { key: "status", direction: "asc" }))).toEqual([
      "sooner",
      "later",
      "never",
    ]);
  });

  it("sorts by number back into the canonical position", () => {
    expect(ids(orderTracks(tracks, noFilter, { key: "number", direction: "desc" }))).toEqual(["d", "c", "b", "a"]);
  });
});

describe("trackActionsFor", () => {
  const actionIds = (track: TrackRequest, permissions = manager) =>
    trackActionsFor(track, permissions).map((action) => action.id);

  it("offers a queued unprioritized track a jump and a cancel", () => {
    expect(actionIds(makeRequestsTrack({ status: RequestStatus.enum.queued, priority: 0 }))).toEqual([
      "prioritize",
      "cancel",
    ]);
  });

  it("offers no jump to a track that already jumped", () => {
    expect(actionIds(makeRequestsTrack({ status: RequestStatus.enum.queued, priority: 6 }))).toEqual(["cancel"]);
  });

  it("offers a failed watched track a retry and a stop, never a cancel", () => {
    expect(actionIds(makeRequestsTrack({ status: RequestStatus.enum.failed, watch_enabled: true }))).toEqual([
      "retry",
      "stopWatch",
    ]);
  });

  it("offers a failed unwatched track the reset-and-resume watch", () => {
    expect(actionIds(makeRequestsTrack({ status: RequestStatus.enum.failed, watch_enabled: false }))).toEqual([
      "retry",
      "resumeWatch",
    ]);
  });

  it("offers a re-import of the kept file when the import refused it", () => {
    const track = makeRequestsTrack({
      status: RequestStatus.enum.failed,
      failure_reason: "import_rejected",
      downloaded_file: "/downloads/a.flac",
    });

    expect(actionIds(track)).toEqual(["reimport", "stopWatch"]);
  });

  it("offers a cancelled track a new request", () => {
    expect(actionIds(makeRequestsTrack({ status: RequestStatus.enum.cancelled }))).toEqual(["requeue"]);
  });

  it("offers a complete track only a better quality", () => {
    expect(actionIds(makeRequestsTrack({ status: RequestStatus.enum.complete }))).toEqual(["upgrade"]);
  });

  it("offers approve and reject on a track awaiting approval, locked to admins", () => {
    const track = makeRequestsTrack({ status: RequestStatus.enum.pending_approval });

    expect(trackActionsFor(track, admin).slice(0, 2)).toEqual([
      { id: "approve", lock: null },
      { id: "reject", lock: null },
    ]);
    expect(trackActionsFor(track, manager).slice(0, 2)).toEqual([
      { id: "approve", lock: "adminOnly" },
      { id: "reject", lock: "adminOnly" },
    ]);
  });

  it("locks every action of someone who cannot manage the request", () => {
    const actions = trackActionsFor(makeRequestsTrack({ status: RequestStatus.enum.queued }), viewer);

    expect(actions.every((action) => action.lock === "ownerOrAdmin")).toBe(true);
  });
});

describe("bulk actions", () => {
  const selected = [
    makeRequestsTrack({ id: "f", status: RequestStatus.enum.failed }),
    makeRequestsTrack({ id: "c", status: RequestStatus.enum.cancelled }),
    makeRequestsTrack({ id: "q", status: RequestStatus.enum.queued, priority: 0 }),
    makeRequestsTrack({ id: "p", status: RequestStatus.enum.pending_approval }),
    makeRequestsTrack({ id: "done", status: RequestStatus.enum.complete }),
  ];

  it("sends each selected track only to the actions that apply to it, cancelled ones apart from retry", () => {
    const targets = bulkActionTargets(selected, admin);

    expect(ids(targets.retry)).toEqual(["f"]);
    expect(ids(targets.requeue)).toEqual(["c"]);
    expect(ids(targets.prioritize)).toEqual(["q"]);
    expect(ids(targets.upgrade)).toEqual(["done"]);
    expect(ids(targets.approve)).toEqual(["p"]);
    expect(ids(targets.reject)).toEqual(["p"]);
    expect(ids(targets.cancel)).toEqual(["q"]);
  });

  it("leaves out what the person is not allowed to do", () => {
    const targets = bulkActionTargets(selected, manager);

    expect(targets.approve).toEqual([]);
    expect(targets.reject).toEqual([]);
    expect(availableBulkActions(targets)).toEqual(["retry", "requeue", "prioritize", "upgrade", "cancel"]);
  });

  it("offers nothing to someone who cannot manage the request", () => {
    expect(availableBulkActions(bulkActionTargets(selected, viewer))).toEqual([]);
  });
});

describe("idsOfStatus", () => {
  it("collects the ids of one status only", () => {
    expect(
      idsOfStatus(
        [
          makeRequestsTrack({ id: "1", status: RequestStatus.enum.failed }),
          makeRequestsTrack({ id: "2", status: RequestStatus.enum.cancelled }),
          makeRequestsTrack({ id: "3", status: RequestStatus.enum.failed }),
        ],
        RequestStatus.enum.failed
      )
    ).toEqual(["1", "3"]);
  });
});
