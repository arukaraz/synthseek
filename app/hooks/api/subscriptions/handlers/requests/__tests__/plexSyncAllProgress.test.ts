import { describe, it, expect, vi, beforeEach } from "vitest";

import { SubscriptionEventType, type PlexSyncAllProgressPayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handlePlexSyncAllProgress } from "../plexSyncAllProgress";
import { subscribePlexSyncAll, type PlexSyncAllUpdate } from "../../../shared/plexSyncAll";

const spies = vi.hoisted(() => ({
  setData: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
        getAll: { invalidate: spies.invalidate },
      },
    }),
  },
}));

function makeEvent(overrides: Partial<PlexSyncAllProgressPayload>): PlexSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlexSyncAllProgress,
    phase: "progress",
    synced: 2,
    total: 8,
    ...overrides,
  };
}

describe("handlePlexSyncAllProgress", () => {
  beforeEach(() => {
    spies.setData.mockReset();
    spies.invalidate.mockReset();
  });

  it("emits the update to subscribers of the shared bus", () => {
    const received: PlexSyncAllUpdate[] = [];
    const unsubscribe = subscribePlexSyncAll((u) => received.push(u));
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "progress", synced: 3, total: 8 }), utils);

    expect(received).toEqual([{ phase: "progress", synced: 3, total: 8, failed: undefined }]);
    unsubscribe();
  });

  it("seeds the query state as running while in progress", () => {
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "progress", synced: 4, total: 10 }), utils);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: true, synced: 4, total: 10 });
    expect(spies.invalidate).not.toHaveBeenCalled();
  });

  it("marks not running and invalidates the list on completion", () => {
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 8, total: 8, failed: 1 }), utils);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: false, synced: 8, total: 8 });
    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });
});
