import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { RequestStatus } from "@api/__generated__/types";

import type { SortDirection, TracklistSortKey } from "../../components/PlaylistDetailBody/types";
import type { TracklistTrack } from "../../components/Tracklist/types";
import { useStableTracklistOrder } from "../useStableTracklistOrder";

function track(externalId: string, status: RequestStatus): TracklistTrack {
  return {
    externalId,
    title: externalId,
    artist: "Doechii",
    artistExternalId: null,
    durationMs: 200000,
    trackNumber: 1,
    plays: null,
    album: null,
    inLibrary: status === "complete",
    requestId: `req_${externalId}`,
    slskd_request_id: null,
    status,
    failureReason: null,
  };
}

interface Props {
  tracks: TracklistTrack[];
  sortKey: TracklistSortKey;
  direction: SortDirection;
}

const ids = (tracks: TracklistTrack[]) => tracks.map((entry) => entry.externalId);

function render(initial: Props) {
  return renderHook((props: Props) => useStableTracklistOrder(props.tracks, props.sortKey, props.direction), {
    initialProps: initial,
  });
}

describe("useStableTracklistOrder", () => {
  it("keeps a retried track where it was while its status changes, rather than moving it from under the pointer", () => {
    const before = [track("anxiety", "cancelled"), track("sapphire", "cancelled"), track("messy", "complete")];
    const { result, rerender } = render({ tracks: before, sortKey: "status", direction: "asc" });
    const firstOrder = ids(result.current);

    rerender({
      tracks: [track("anxiety", "searching"), track("sapphire", "cancelled"), track("messy", "complete")],
      sortKey: "status",
      direction: "asc",
    });

    expect(ids(result.current)).toEqual(firstOrder);
    expect(result.current.find((entry) => entry.externalId === "anxiety")?.status).toBe("searching");
  });

  it("sorts again when the listener picks another order", () => {
    const tracks = [track("b", "complete"), track("a", "cancelled")];
    const { result, rerender } = render({ tracks, sortKey: "status", direction: "asc" });

    rerender({ tracks, sortKey: "name", direction: "asc" });

    expect(ids(result.current)).toEqual(["a", "b"]);
  });

  it("sorts again when a track joins or leaves the list", () => {
    const { result, rerender } = render({
      tracks: [track("b", "cancelled"), track("a", "cancelled")],
      sortKey: "name",
      direction: "asc",
    });

    rerender({ tracks: [track("c", "cancelled"), track("b", "cancelled")], sortKey: "name", direction: "asc" });

    expect(ids(result.current)).toEqual(["b", "c"]);
  });
});
