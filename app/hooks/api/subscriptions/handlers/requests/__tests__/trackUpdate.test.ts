import { describe, it, expect, vi, beforeEach } from "vitest";

import type { QueryClient } from "@tanstack/react-query";

import { FailureReason, RequestStatus, SubscriptionEventType, type TrackUpdatePayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handleTrackUpdate } from "../trackUpdate";

const spies = vi.hoisted(() => ({
  getAllSetData: vi.fn(),
  setQueriesData: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    contentDetail: {
      albumDetail: {},
      artistTopTracks: {},
      playlistDetail: {},
    },
    useUtils: () => ({
      requests: {
        getAll: { setData: spies.getAllSetData },
      },
    }),
  },
}));

const queryClient: QueryClient = { setQueriesData: spies.setQueriesData } as unknown as QueryClient;

vi.mock("@trpc/react-query", () => ({
  getQueryKey: (proc: unknown) => {
    if (proc === trpc.contentDetail.albumDetail) return ["contentDetail", "albumDetail"];
    if (proc === trpc.contentDetail.artistTopTracks) return ["contentDetail", "artistTopTracks"];
    if (proc === trpc.contentDetail.playlistDetail) return ["contentDetail", "playlistDetail"];
    return ["unknown"];
  },
}));

interface DetailRow {
  externalId: string;
  requestId: string | null;
  slskd_request_id: string | null;
  status: RequestStatus | null;
  failureReason: FailureReason | null;
}

function makeRow(overrides: Partial<DetailRow>): DetailRow {
  return {
    externalId: "ext-1",
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<TrackUpdatePayload>): TrackUpdatePayload {
  return {
    eventType: SubscriptionEventType.TrackUpdate,
    requestId: "track-db-1",
    status: RequestStatus.enum.downloading,
    message: "Downloading",
    ...overrides,
  };
}

function runUpdater<T>(queryKeyTag: string, value: T): T {
  const call = spies.setQueriesData.mock.calls.find(
    (args) => Array.isArray(args[0].queryKey) && args[0].queryKey[1] === queryKeyTag
  );
  if (!call) throw new Error(`no setQueriesData call for ${queryKeyTag}`);
  const updater = call[1];
  return updater(value);
}

describe("handleTrackUpdate content-detail patches", () => {
  beforeEach(() => {
    spies.getAllSetData.mockReset();
    spies.setQueriesData.mockReset();
  });

  it("patches the matching albumDetail track row by slskd_request_id", () => {
    const utils = trpc.useUtils();
    const matching = makeRow({ externalId: "a", slskd_request_id: "req_1", status: RequestStatus.enum.searching });
    const other = makeRow({ externalId: "b", slskd_request_id: "req_2", status: RequestStatus.enum.searching });

    handleTrackUpdate(makeEvent({ requestId: "req_1", status: RequestStatus.enum.complete }), utils, queryClient);

    const next = runUpdater("albumDetail", { tracks: [matching, other] });

    expect(next.tracks[0].status).toBe(RequestStatus.enum.complete);
    expect(next.tracks[1]).toBe(other);
  });

  it("writes failureReason onto a failed albumDetail row", () => {
    const utils = trpc.useUtils();
    const row = makeRow({ slskd_request_id: "req_1", status: RequestStatus.enum.downloading });

    handleTrackUpdate(
      makeEvent({
        requestId: "req_1",
        status: RequestStatus.enum.failed,
        failureReason: FailureReason.enum.not_found,
      }),
      utils,
      queryClient
    );

    const next = runUpdater("albumDetail", { tracks: [row] });

    expect(next.tracks[0].status).toBe(RequestStatus.enum.failed);
    expect(next.tracks[0].failureReason).toBe(FailureReason.enum.not_found);
  });

  it("patches the matching artistTopTracks row and leaves non-matches untouched", () => {
    const utils = trpc.useUtils();
    const matching = makeRow({ externalId: "a", slskd_request_id: "req_1", status: RequestStatus.enum.searching });
    const nonMatch = makeRow({ externalId: "b", slskd_request_id: "req_9", status: RequestStatus.enum.downloading });
    const absent = makeRow({ externalId: "c", slskd_request_id: null });

    handleTrackUpdate(makeEvent({ requestId: "req_1", status: RequestStatus.enum.complete }), utils, queryClient);

    const next = runUpdater("artistTopTracks", [matching, nonMatch, absent]);

    expect(next[0].status).toBe(RequestStatus.enum.complete);
    expect(next[1]).toBe(nonMatch);
    expect(next[2]).toBe(absent);
  });

  it("patches the matching playlistDetail track row by slskd_request_id", () => {
    const utils = trpc.useUtils();
    const matching = makeRow({ externalId: "a", slskd_request_id: "req_1", status: RequestStatus.enum.searching });
    const other = makeRow({ externalId: "b", slskd_request_id: "req_2", status: RequestStatus.enum.searching });

    handleTrackUpdate(makeEvent({ requestId: "req_1", status: RequestStatus.enum.complete }), utils, queryClient);

    const next = runUpdater("playlistDetail", { tracks: [matching, other] });

    expect(next.tracks[0].status).toBe(RequestStatus.enum.complete);
    expect(next.tracks[1]).toBe(other);
  });

  it("returns the same albumDetail reference when no row matches", () => {
    const utils = trpc.useUtils();
    const row = makeRow({ slskd_request_id: "req_other" });
    const cache = { tracks: [row] };

    handleTrackUpdate(makeEvent({ requestId: "req_1" }), utils, queryClient);

    const next = runUpdater("albumDetail", cache);

    expect(next).toBe(cache);
  });

  it("ignores rows with a null slskd_request_id even when the cuid requestId equals the event", () => {
    const utils = trpc.useUtils();
    const row = makeRow({ requestId: "req_1", slskd_request_id: null, status: null });

    handleTrackUpdate(makeEvent({ requestId: "req_1" }), utils, queryClient);

    const next = runUpdater("artistTopTracks", [row]);

    expect(next[0]).toBe(row);
  });
});
