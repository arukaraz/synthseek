import { describe, it, expect } from "vitest";
import {
  isDropImportBatchInFlight,
  isProcessingStatus,
  isReimportableFailure,
  isRequestedStatus,
  isRetryableStatus,
  isSpinningStatus,
} from "../status-helpers";
import { DropImportBatchStatus, FailureReason, RequestStatus } from "@api/__generated__/types";

describe("isProcessingStatus", () => {
  it("returns true for queued status", () => {
    expect(isProcessingStatus(RequestStatus.enum.queued)).toBe(true);
  });

  it("returns true for in_progress status", () => {
    expect(isProcessingStatus(RequestStatus.enum.in_progress)).toBe(true);
  });

  it("returns true for searching status", () => {
    expect(isProcessingStatus(RequestStatus.enum.searching)).toBe(true);
  });

  it("returns true for pending_download status", () => {
    expect(isProcessingStatus(RequestStatus.enum.pending_download)).toBe(true);
  });

  it("returns true for downloading status", () => {
    expect(isProcessingStatus(RequestStatus.enum.downloading)).toBe(true);
  });

  it("returns true for paused status", () => {
    expect(isProcessingStatus(RequestStatus.enum.paused)).toBe(true);
  });

  it("returns true for pending_import status", () => {
    expect(isProcessingStatus(RequestStatus.enum.pending_import)).toBe(true);
  });

  it("returns true for importing status", () => {
    expect(isProcessingStatus(RequestStatus.enum.importing)).toBe(true);
  });

  it("returns false for complete status", () => {
    expect(isProcessingStatus(RequestStatus.enum.complete)).toBe(false);
  });

  it("returns false for partially_complete status", () => {
    expect(isProcessingStatus(RequestStatus.enum.partially_complete)).toBe(false);
  });

  it("returns false for failed status", () => {
    expect(isProcessingStatus(RequestStatus.enum.failed)).toBe(false);
  });

  it("returns false for cancelled status", () => {
    expect(isProcessingStatus(RequestStatus.enum.cancelled)).toBe(false);
  });
});

describe("isSpinningStatus", () => {
  it("returns false for queued status", () => {
    expect(isSpinningStatus(RequestStatus.enum.queued)).toBe(false);
  });

  it("returns true for in_progress status", () => {
    expect(isSpinningStatus(RequestStatus.enum.in_progress)).toBe(true);
  });

  it("returns true for searching status", () => {
    expect(isSpinningStatus(RequestStatus.enum.searching)).toBe(true);
  });

  it("returns true for pending_download status", () => {
    expect(isSpinningStatus(RequestStatus.enum.pending_download)).toBe(true);
  });

  it("returns true for downloading status", () => {
    expect(isSpinningStatus(RequestStatus.enum.downloading)).toBe(true);
  });

  it("returns true for paused status", () => {
    expect(isSpinningStatus(RequestStatus.enum.paused)).toBe(true);
  });

  it("returns true for pending_import status", () => {
    expect(isSpinningStatus(RequestStatus.enum.pending_import)).toBe(true);
  });

  it("returns true for importing status", () => {
    expect(isSpinningStatus(RequestStatus.enum.importing)).toBe(true);
  });

  it("returns false for complete status", () => {
    expect(isSpinningStatus(RequestStatus.enum.complete)).toBe(false);
  });

  it("returns false for failed status", () => {
    expect(isSpinningStatus(RequestStatus.enum.failed)).toBe(false);
  });

  it("returns false for cancelled status", () => {
    expect(isSpinningStatus(RequestStatus.enum.cancelled)).toBe(false);
  });

  it("returns false for partially_complete status", () => {
    expect(isSpinningStatus(RequestStatus.enum.partially_complete)).toBe(false);
  });
});

describe("isRetryableStatus", () => {
  it("returns true for failed status", () => {
    expect(isRetryableStatus(RequestStatus.enum.failed)).toBe(true);
  });

  it("returns true for cancelled status", () => {
    expect(isRetryableStatus(RequestStatus.enum.cancelled)).toBe(true);
  });

  it("returns false for complete status", () => {
    expect(isRetryableStatus(RequestStatus.enum.complete)).toBe(false);
  });

  it("returns false for partially_complete status", () => {
    expect(isRetryableStatus(RequestStatus.enum.partially_complete)).toBe(false);
  });

  it("returns false for active statuses", () => {
    expect(isRetryableStatus(RequestStatus.enum.queued)).toBe(false);
    expect(isRetryableStatus(RequestStatus.enum.in_progress)).toBe(false);
    expect(isRetryableStatus(RequestStatus.enum.downloading)).toBe(false);
    expect(isRetryableStatus(RequestStatus.enum.importing)).toBe(false);
  });
});

describe("isRequestedStatus", () => {
  it("returns false for a null status (catalog/preloaded)", () => {
    expect(isRequestedStatus(null)).toBe(false);
  });

  it("returns false for failed and cancelled", () => {
    expect(isRequestedStatus(RequestStatus.enum.failed)).toBe(false);
    expect(isRequestedStatus(RequestStatus.enum.cancelled)).toBe(false);
  });

  it("returns true for complete", () => {
    expect(isRequestedStatus(RequestStatus.enum.complete)).toBe(true);
  });

  it("returns true for in-flight statuses", () => {
    expect(isRequestedStatus(RequestStatus.enum.queued)).toBe(true);
    expect(isRequestedStatus(RequestStatus.enum.downloading)).toBe(true);
    expect(isRequestedStatus(RequestStatus.enum.importing)).toBe(true);
    expect(isRequestedStatus(RequestStatus.enum.partially_complete)).toBe(true);
  });
});

describe("isDropImportBatchInFlight", () => {
  it("returns true while the server is still working the batch", () => {
    expect(isDropImportBatchInFlight(DropImportBatchStatus.enum.queued)).toBe(true);
    expect(isDropImportBatchInFlight(DropImportBatchStatus.enum.processing)).toBe(true);
  });

  it("returns false for every terminal status, partial included", () => {
    expect(isDropImportBatchInFlight(DropImportBatchStatus.enum.completed)).toBe(false);
    expect(isDropImportBatchInFlight(DropImportBatchStatus.enum.partial)).toBe(false);
    expect(isDropImportBatchInFlight(DropImportBatchStatus.enum.failed)).toBe(false);
  });

  it("splits the whole batch-status enum into exactly the two known partitions", () => {
    const inFlight = DropImportBatchStatus.options.filter(isDropImportBatchInFlight);
    const settled = DropImportBatchStatus.options.filter((status) => !isDropImportBatchInFlight(status));

    expect(new Set(inFlight)).toEqual(
      new Set([DropImportBatchStatus.enum.queued, DropImportBatchStatus.enum.processing])
    );
    expect(new Set(settled)).toEqual(
      new Set([
        DropImportBatchStatus.enum.completed,
        DropImportBatchStatus.enum.partial,
        DropImportBatchStatus.enum.failed,
      ])
    );
  });
});

describe("isReimportableFailure", () => {
  it("returns true only when reason is import_rejected and a downloaded file is present", () => {
    expect(isReimportableFailure(FailureReason.enum.import_rejected, "track.mp3")).toBe(true);
  });

  it("returns false when reason is import_rejected but no downloaded file", () => {
    expect(isReimportableFailure(FailureReason.enum.import_rejected, null)).toBe(false);
    expect(isReimportableFailure(FailureReason.enum.import_rejected, "")).toBe(false);
    expect(isReimportableFailure(FailureReason.enum.import_rejected, undefined)).toBe(false);
  });

  it("returns false for any other reason", () => {
    expect(isReimportableFailure(FailureReason.enum.not_found, "track.mp3")).toBe(false);
    expect(isReimportableFailure(FailureReason.enum.p2p_failed, "track.mp3")).toBe(false);
    expect(isReimportableFailure(FailureReason.enum.other, "track.mp3")).toBe(false);
  });

  it("returns false when reason is null/undefined", () => {
    expect(isReimportableFailure(null, "track.mp3")).toBe(false);
    expect(isReimportableFailure(undefined, "track.mp3")).toBe(false);
  });
});
