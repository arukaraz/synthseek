import { describe, it, expect, vi, beforeEach } from "vitest";

import { SubscriptionEventType, type DropImportUpdatePayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handleDropImportUpdate } from "../dropImportUpdate";

const spies = vi.hoisted(() => ({
  invalidateGetBatch: vi.fn(),
  invalidateListBatches: vi.fn(),
  invalidateAll: vi.fn(),
  invalidateAlbums: vi.fn(),
  invalidateArtists: vi.fn(),
  invalidatePlaylists: vi.fn(),
  invalidateTracks: vi.fn(),
  invalidateCounts: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      import: {
        getBatch: { invalidate: spies.invalidateGetBatch },
        listBatches: { invalidate: spies.invalidateListBatches },
      },
      requests: {
        getAll: { invalidate: spies.invalidateAll },
      },
      library: {
        getAlbums: { invalidate: spies.invalidateAlbums },
        getArtists: { invalidate: spies.invalidateArtists },
        getPlaylists: { invalidate: spies.invalidatePlaylists },
        getTracks: { invalidate: spies.invalidateTracks },
        getCounts: { invalidate: spies.invalidateCounts },
      },
    }),
  },
}));

function utils() {
  return trpc.useUtils();
}

function makeEvent(overrides: Partial<DropImportUpdatePayload>): DropImportUpdatePayload {
  return {
    eventType: SubscriptionEventType.DropImportUpdate,
    batchId: "batch-1",
    status: "processing",
    totalFiles: 3,
    importedFiles: 0,
    pendingFiles: 0,
    failedFiles: 0,
    discardedFiles: 0,
    ...overrides,
  };
}

describe("handleDropImportUpdate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates the batch and list queries on every event", () => {
    handleDropImportUpdate(makeEvent({}), utils());

    expect(spies.invalidateGetBatch).toHaveBeenCalledWith({ batchId: "batch-1" });
    expect(spies.invalidateListBatches).toHaveBeenCalledTimes(1);
    expect(spies.invalidateAll).not.toHaveBeenCalled();
    expect(spies.invalidateTracks).not.toHaveBeenCalled();
  });

  it("invalidates requests and library views when a file lands imported", () => {
    handleDropImportUpdate(
      makeEvent({ importedFiles: 1, file: { id: "f1", name: "a.mp3", status: "imported" } }),
      utils()
    );

    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
    expect(spies.invalidateTracks).toHaveBeenCalledTimes(1);
    expect(spies.invalidateCounts).toHaveBeenCalledTimes(1);
  });

  it("invalidates requests and library views when the batch reaches a terminal status", () => {
    handleDropImportUpdate(makeEvent({ status: "completed", importedFiles: 3 }), utils());

    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
    expect(spies.invalidateAlbums).toHaveBeenCalledTimes(1);
  });

  it("does not touch library views for a non-terminal file tick", () => {
    handleDropImportUpdate(makeEvent({ file: { id: "f1", name: "a.mp3", status: "importing" } }), utils());

    expect(spies.invalidateAll).not.toHaveBeenCalled();
    expect(spies.invalidateAlbums).not.toHaveBeenCalled();
  });
});
