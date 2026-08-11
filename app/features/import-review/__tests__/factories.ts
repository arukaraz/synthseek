import type { ImportReviewEvidence, ImportReviewItem } from "../types";

interface ReviewItemOverrides extends Partial<Omit<ImportReviewItem, "evidence" | "track">> {
  evidence?: Partial<ImportReviewEvidence>;
  track?: Partial<ImportReviewItem["track"]>;
}

export function makeReviewItem(overrides: ReviewItemOverrides = {}): ImportReviewItem {
  const { evidence, track, ...rest } = overrides;

  return {
    id: "held-1",
    status: "pending",
    reason: "fingerprint_mismatch",
    source: "slskd",
    sourceUsername: "peer-one",
    sourceFilename: "Music/peer.flac",
    originalFilename: "peer-copy.flac",
    sizeBytes: 12_582_912,
    error: null,
    createdAt: new Date("2026-08-01T10:00:00.000Z"),
    ...rest,
    evidence: {
      artist: "Artist X",
      title: "Song Y",
      score: 32,
      observedConfidence: null,
      expectedConfidence: null,
      observedDurationMs: null,
      expectedDurationMs: null,
      ...evidence,
    },
    track: {
      id: "track-1",
      title: "Requested Song",
      artist: "Requested Artist",
      status: "failed",
      retryCount: 0,
      nextRetryAt: null,
      ...track,
    },
  };
}
