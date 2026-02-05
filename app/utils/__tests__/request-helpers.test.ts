import { describe, it, expect } from "vitest";
import { isSingleTrackRequest, calculateAlbumStatus } from "../request-helpers";
import { RequestStatus, ContentType } from "@api/__generated__/types";
import {
  createTrackRequest,
  createCompletedTrack,
  createFailedTrack,
  createDownloadingTrack,
} from "@test/factories";

describe("isSingleTrackRequest", () => {
  it("returns false for empty array", () => {
    expect(isSingleTrackRequest([])).toBe(false);
  });

  it("returns true for single track with type track", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.track });
    expect(isSingleTrackRequest([track])).toBe(true);
  });

  it("returns false for single track with type album", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.album });
    expect(isSingleTrackRequest([track])).toBe(false);
  });

  it("returns false for multiple tracks", () => {
    const tracks = [
      createTrackRequest({ request_type: ContentType.enum.track }),
      createTrackRequest({ request_type: ContentType.enum.track }),
    ];
    expect(isSingleTrackRequest(tracks)).toBe(false);
  });

  it("returns false for single track with type playlist", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.playlist });
    expect(isSingleTrackRequest([track])).toBe(false);
  });

  it("returns false for single track with type artist", () => {
    const track = createTrackRequest({ request_type: ContentType.enum.artist });
    expect(isSingleTrackRequest([track])).toBe(false);
  });
});

describe("calculateAlbumStatus", () => {
  it("returns queued for empty tracks array", () => {
    const result = calculateAlbumStatus([]);
    expect(result.newStatus).toBe(RequestStatus.enum.queued);
    expect(result.completedCount).toBe(0);
    expect(result.failedCount).toBe(0);
    expect(result.totalTracks).toBe(0);
    expect(result.completedAt).toBeNull();
  });

  it("returns complete when all tracks are complete", () => {
    const tracks = [createCompletedTrack(), createCompletedTrack(), createCompletedTrack()];
    const result = calculateAlbumStatus(tracks);
    expect(result.newStatus).toBe(RequestStatus.enum.complete);
    expect(result.completedCount).toBe(3);
    expect(result.failedCount).toBe(0);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("returns failed when all tracks are failed", () => {
    const tracks = [createFailedTrack(), createFailedTrack(), createFailedTrack()];
    const result = calculateAlbumStatus(tracks);
    expect(result.newStatus).toBe(RequestStatus.enum.failed);
    expect(result.completedCount).toBe(0);
    expect(result.failedCount).toBe(3);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("returns partially_complete when some complete and some failed (multi-track album)", () => {
    const tracks = [
      createCompletedTrack({ request_type: ContentType.enum.album }),
      createFailedTrack({ request_type: ContentType.enum.album }),
      createCompletedTrack({ request_type: ContentType.enum.album }),
    ];
    const result = calculateAlbumStatus(tracks);
    expect(result.newStatus).toBe(RequestStatus.enum.partially_complete);
    expect(result.completedCount).toBe(2);
    expect(result.failedCount).toBe(1);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it("returns in_progress when some tracks are still processing", () => {
    const tracks = [createCompletedTrack(), createDownloadingTrack(), createTrackRequest()];
    const result = calculateAlbumStatus(tracks);
    expect(result.newStatus).toBe(RequestStatus.enum.in_progress);
    expect(result.completedAt).toBeNull();
  });

  it("returns in_progress when some tracks are complete but others are queued", () => {
    const tracks = [
      createCompletedTrack(),
      createTrackRequest({ status: RequestStatus.enum.queued }),
    ];
    const result = calculateAlbumStatus(tracks);
    expect(result.newStatus).toBe(RequestStatus.enum.in_progress);
  });

  it("returns in_progress when all tracks are queued (queued is a processing status)", () => {
    const tracks = [
      createTrackRequest({ status: RequestStatus.enum.queued }),
      createTrackRequest({ status: RequestStatus.enum.queued }),
    ];
    const result = calculateAlbumStatus(tracks);
    expect(result.newStatus).toBe(RequestStatus.enum.in_progress);
  });

  it("returns failed for single track request that failed", () => {
    const track = createFailedTrack({ request_type: ContentType.enum.track });
    const result = calculateAlbumStatus([track]);
    expect(result.newStatus).toBe(RequestStatus.enum.failed);
  });

  it("returns complete for single track request that completed", () => {
    const track = createCompletedTrack({ request_type: ContentType.enum.track });
    const result = calculateAlbumStatus([track]);
    expect(result.newStatus).toBe(RequestStatus.enum.complete);
  });

  it("does not return partially_complete for single track request", () => {
    const track = createCompletedTrack({ request_type: ContentType.enum.track });
    track.status = RequestStatus.enum.failed;
    const result = calculateAlbumStatus([track]);
    expect(result.newStatus).not.toBe(RequestStatus.enum.partially_complete);
  });

  it("correctly counts tracks in mixed states", () => {
    const tracks = [
      createCompletedTrack(),
      createCompletedTrack(),
      createFailedTrack(),
      createDownloadingTrack(),
      createTrackRequest({ status: RequestStatus.enum.queued }),
    ];
    const result = calculateAlbumStatus(tracks);
    expect(result.completedCount).toBe(2);
    expect(result.failedCount).toBe(1);
    expect(result.totalTracks).toBe(5);
    expect(result.newStatus).toBe(RequestStatus.enum.in_progress);
  });
});
