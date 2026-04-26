import { describe, it, expect } from "vitest";
import { isProcessingStatus, isReimportableFailure, isSpinningStatus } from "../status-helpers";
import { FailureReason, RequestStatus } from "@api/__generated__/types";

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
