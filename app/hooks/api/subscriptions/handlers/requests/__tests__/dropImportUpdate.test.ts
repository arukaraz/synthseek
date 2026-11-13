import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SubscriptionEventType,
  type DropImportBatchRow,
  type DropImportFileRow,
  type DropImportUpdatePayload,
} from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handleDropImportUpdate } from "../dropImportUpdate";
import { resetThrottledInvalidations } from "../../../shared/throttledInvalidation";

type BatchWithFiles = DropImportBatchRow & { files: DropImportFileRow[] };

const cache = vi.hoisted(() => ({
  list: undefined as unknown,
  batches: new Map<string, unknown>(),
}));

const spies = vi.hoisted(() => ({
  invalidateGetBatch: vi.fn(),
  invalidateListBatches: vi.fn(),
  invalidateAll: vi.fn(),
  invalidateAlbums: vi.fn(),
  invalidateTracks: vi.fn(),
  invalidateCounts: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      import: {
        getBatch: {
          invalidate: spies.invalidateGetBatch,
          setData: (input: { batchId: string }, update: (old: unknown) => unknown) => {
            cache.batches.set(input.batchId, update(cache.batches.get(input.batchId)));
          },
        },
        listBatches: {
          invalidate: spies.invalidateListBatches,
          setData: (_input: undefined, update: (old: unknown) => unknown) => {
            cache.list = update(cache.list);
          },
        },
      },
      requests: {
        getAll: { invalidate: spies.invalidateAll },
        getRecentTracks: { invalidate: vi.fn() },
        getDetail: { invalidate: vi.fn() },
      },
      library: {
        getAlbums: { invalidate: spies.invalidateAlbums },
        getArtists: { invalidate: vi.fn() },
        getPlaylists: { invalidate: vi.fn() },
        getTracks: { invalidate: spies.invalidateTracks },
        getCounts: { invalidate: spies.invalidateCounts },
      },
    }),
  },
}));

function utils() {
  return trpc.useUtils();
}

function makeBatch(overrides: Partial<DropImportBatchRow> = {}): DropImportBatchRow {
  return {
    id: "batch-1",
    user_id: "u1",
    status: "processing",
    total_files: 3,
    imported_files: 0,
    already_in_library_files: 0,
    pending_files: 0,
    failed_files: 0,
    discarded_files: 0,
    created_at: new Date(1_000),
    updated_at: new Date(2_000),
    ...overrides,
  };
}

function makeFile(overrides: Partial<DropImportFileRow> = {}): DropImportFileRow {
  return {
    id: "f1",
    batch_id: "batch-1",
    original_name: "a.mp3",
    status: "received",
    tag_title: null,
    tag_artist: null,
    tag_album: null,
    duration_ms: null,
    identified_external_id: null,
    collision: null,
    error: null,
    created_at: new Date(1_000),
    updated_at: new Date(2_000),
    ...overrides,
  };
}

function makeEvent(batch: Partial<DropImportBatchRow> = {}, file?: DropImportFileRow): DropImportUpdatePayload {
  return {
    eventType: SubscriptionEventType.DropImportUpdate,
    batchId: "batch-1",
    batch: makeBatch(batch),
    ...(file ? { file } : {}),
  };
}

describe("handleDropImportUpdate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetThrottledInvalidations();
    vi.clearAllMocks();
    cache.list = undefined;
    cache.batches.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes the batch and the file it names into both caches, and asks the server for neither", () => {
    const other = makeBatch({ id: "batch-0" });
    const second = makeFile({ id: "f2", original_name: "b.mp3" });
    cache.list = [makeBatch(), other];
    cache.batches.set("batch-1", { ...makeBatch(), files: [makeFile(), second] } satisfies BatchWithFiles);
    const landed = makeFile({ status: "imported", tag_title: "Airbag" });

    handleDropImportUpdate(makeEvent({ imported_files: 1 }, landed), utils());

    expect(cache.list).toEqual([makeBatch({ imported_files: 1 }), other]);
    expect(cache.batches.get("batch-1")).toEqual({ ...makeBatch({ imported_files: 1 }), files: [landed, second] });
    expect(spies.invalidateGetBatch).not.toHaveBeenCalled();
    expect(spies.invalidateListBatches).not.toHaveBeenCalled();
  });

  it("puts a batch the list has not seen first, and leaves the files alone when the event names none", () => {
    const older = makeBatch({ id: "batch-0" });
    cache.list = [older];
    cache.batches.set("batch-1", { ...makeBatch(), files: [makeFile()] } satisfies BatchWithFiles);

    handleDropImportUpdate(makeEvent({ status: "processing", pending_files: 1 }), utils());

    expect(cache.list).toEqual([makeBatch({ pending_files: 1 }), older]);
    expect(cache.batches.get("batch-1")).toEqual({ ...makeBatch({ pending_files: 1 }), files: [makeFile()] });
  });

  it("leaves a cache nobody has loaded empty, so the first read still comes from the server", () => {
    handleDropImportUpdate(makeEvent({}, makeFile({ status: "importing" })), utils());

    expect(cache.list).toBeUndefined();
    expect(cache.batches.get("batch-1")).toBeUndefined();
  });

  it.each(["imported", "already_in_library"] as const)(
    "refreshes requests and the library when a file lands %s",
    (status) => {
      handleDropImportUpdate(makeEvent({}, makeFile({ status })), utils());

      expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
      expect(spies.invalidateTracks).toHaveBeenCalledTimes(1);
      expect(spies.invalidateCounts).toHaveBeenCalledTimes(1);
    }
  );

  it("refreshes the library once at the start of a run of landed files and once more at its end", () => {
    for (let index = 0; index < 40; index++) {
      handleDropImportUpdate(makeEvent({}, makeFile({ id: `f${index}`, status: "imported" })), utils());
    }

    expect(spies.invalidateTracks).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);

    expect(spies.invalidateTracks).toHaveBeenCalledTimes(2);
  });

  it("refreshes requests and the library at once when the batch settles, even inside a run", () => {
    handleDropImportUpdate(makeEvent({}, makeFile({ status: "imported" })), utils());
    handleDropImportUpdate(makeEvent({ status: "completed", imported_files: 3 }), utils());

    expect(spies.invalidateAll).toHaveBeenCalledTimes(2);
    expect(spies.invalidateAlbums).toHaveBeenCalledTimes(2);
  });

  it("does not touch the library for a file that has not landed", () => {
    handleDropImportUpdate(makeEvent({}, makeFile({ status: "importing" })), utils());

    expect(spies.invalidateAll).not.toHaveBeenCalled();
    expect(spies.invalidateAlbums).not.toHaveBeenCalled();
  });
});
