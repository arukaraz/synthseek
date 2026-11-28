import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DropImportBatchStatus,
  RequestStatus,
  SubscriptionEventType,
  type AlbumUpdatePayload,
  type DropImportUpdatePayload,
  type LibraryImportProgressPayload,
} from "@api/__generated__/types";

import {
  announceAlbumProgress,
  announceDropImport,
  announceLibraryImport,
  resetProgressAnnouncements,
} from "../progressAnnouncements";

const spoken = vi.hoisted(() => ({ calls: [] as string[] }));

vi.mock("@utils/announcer", () => ({
  announce: (text: string) => {
    spoken.calls.push(text);
  },
}));

vi.mock("@locale", () => ({
  default: {
    t: (key: string, params?: Record<string, number>) =>
      params === undefined ? key : `${key} ${JSON.stringify(params)}`,
  },
}));

function album(status: RequestStatus, completedTracks: number): AlbumUpdatePayload {
  return { eventType: SubscriptionEventType.AlbumUpdate, albumId: "a1", status, completedTracks, totalTracks: 12 };
}

function batch(status: DropImportBatchStatus, userId = "u1"): DropImportUpdatePayload {
  return {
    eventType: SubscriptionEventType.DropImportUpdate,
    batchId: "b1",
    batch: {
      id: "b1",
      user_id: userId,
      status,
      total_files: 4,
      imported_files: 3,
      already_in_library_files: 0,
      pending_files: 0,
      failed_files: 1,
      discarded_files: 0,
      created_at: new Date(0),
      updated_at: new Date(0),
    },
  };
}

function libraryImport(phase: LibraryImportProgressPayload["phase"], imported: number, failed: number) {
  return {
    eventType: SubscriptionEventType.LibraryImportProgress,
    userId: "u1",
    jobId: "j1",
    provider: "spotify",
    phase,
    imported,
    failed,
    total: imported + failed,
  } satisfies LibraryImportProgressPayload;
}

beforeEach(() => {
  spoken.calls.length = 0;
  resetProgressAnnouncements();
});

describe("a full album download", () => {
  it("speaks at most three times however many updates it sends", () => {
    announceAlbumProgress(album(RequestStatus.enum.queued, 0));
    for (let done = 0; done < 12; done += 1) announceAlbumProgress(album(RequestStatus.enum.downloading, done));
    announceAlbumProgress(album(RequestStatus.enum.importing, 12));
    announceAlbumProgress(album(RequestStatus.enum.complete, 12));
    announceAlbumProgress(album(RequestStatus.enum.complete, 12));

    expect(spoken.calls).toHaveLength(2);
    expect(spoken.calls[0]).toContain("downloadStarted");
    expect(spoken.calls[1]).toContain("downloadFinished");
  });

  it("says that it failed once and stays quiet about the repeats", () => {
    announceAlbumProgress(album(RequestStatus.enum.downloading, 1));
    announceAlbumProgress(album(RequestStatus.enum.failed, 1));
    announceAlbumProgress(album(RequestStatus.enum.failed, 1));

    expect(spoken.calls.map((call) => call.split(" ")[0])).toEqual([
      "components:a11yMode.progress.downloadStarted",
      "components:a11yMode.progress.downloadFailed",
    ]);
  });

  it("speaks again for a second run of the same album", () => {
    announceAlbumProgress(album(RequestStatus.enum.downloading, 0));
    announceAlbumProgress(album(RequestStatus.enum.complete, 12));
    announceAlbumProgress(album(RequestStatus.enum.downloading, 0));

    expect(spoken.calls).toHaveLength(3);
  });

  it("does not speak for a cancellation", () => {
    announceAlbumProgress(album(RequestStatus.enum.cancelled, 0));

    expect(spoken.calls).toEqual([]);
  });
});

describe("imports", () => {
  it("announces the start and the finish of a library import with its counts", () => {
    announceLibraryImport(libraryImport("start", 0, 0), "u1");
    announceLibraryImport(libraryImport("progress", 5, 0), "u1");
    announceLibraryImport(libraryImport("complete", 9, 1), "u1");

    expect(spoken.calls).toHaveLength(2);
    expect(spoken.calls[1]).toContain('"imported":9');
    expect(spoken.calls[1]).toContain('"failed":1');
  });

  it("reports an import that brought nothing in as failed", () => {
    announceLibraryImport(libraryImport("complete", 0, 3), "u1");

    expect(spoken.calls[0]).toContain("importFailed");
  });

  it("stays silent for another member's import", () => {
    announceLibraryImport(libraryImport("start", 0, 0), "someone-else");
    announceDropImport(batch(DropImportBatchStatus.enum.processing, "someone-else"), "u1");

    expect(spoken.calls).toEqual([]);
  });

  it("announces a dropped batch once when it starts and once when it settles", () => {
    announceDropImport(batch(DropImportBatchStatus.enum.queued), "u1");
    announceDropImport(batch(DropImportBatchStatus.enum.processing), "u1");
    announceDropImport(batch(DropImportBatchStatus.enum.partial), "u1");
    announceDropImport(batch(DropImportBatchStatus.enum.partial), "u1");

    expect(spoken.calls).toHaveLength(2);
    expect(spoken.calls[1]).toContain("importFinished");
  });
});
