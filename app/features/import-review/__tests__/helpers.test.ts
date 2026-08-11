import i18n from "@locale";
import { describe, expect, it } from "vitest";

import { evidenceSentence, heldAudioUrl, heldImportErrorKey, parseRetentionDays } from "../helpers";
import { makeReviewItem } from "./factories";

const t = i18n.getFixedT("en", "requests");

describe("heldAudioUrl", () => {
  it("points at the review audio endpoint with an encoded id", () => {
    expect(heldAudioUrl("held 1/2")).toBe("/api/v1/review/held%201%2F2/audio");
  });
});

describe("heldImportErrorKey", () => {
  it("maps each held-import error token to its own key", () => {
    expect(heldImportErrorKey("heldFileMissingAfterRestart")).toBe("review.error.heldFileMissingAfterRestart");
    expect(heldImportErrorKey("heldFileMissing")).toBe("review.error.heldFileMissing");
    expect(heldImportErrorKey("importFailedBeforeMove")).toBe("review.error.importFailedBeforeMove");
    expect(heldImportErrorKey("importFailedAfterMove")).toBe("review.error.importFailedAfterMove");
  });

  it("falls back to the unknown key for an unrecognised token", () => {
    expect(heldImportErrorKey("something-else")).toBe("review.error.unknown");
  });
});

describe("parseRetentionDays", () => {
  it("accepts the whole range the server accepts", () => {
    expect(parseRetentionDays("1")).toBe(1);
    expect(parseRetentionDays(" 14 ")).toBe(14);
    expect(parseRetentionDays("365")).toBe(365);
  });

  it("rejects the values the server would reject", () => {
    expect(parseRetentionDays("0")).toBeNull();
    expect(parseRetentionDays("366")).toBeNull();
    expect(parseRetentionDays("-5")).toBeNull();
    expect(parseRetentionDays("14.5")).toBeNull();
  });

  it("rejects an empty or unparsable field instead of reading it as zero", () => {
    expect(parseRetentionDays("")).toBeNull();
    expect(parseRetentionDays("   ")).toBeNull();
    expect(parseRetentionDays("abc")).toBeNull();
  });
});

describe("evidenceSentence", () => {
  it("names the fingerprinted recording and keeps the similarity on the 0 to 100 scale", () => {
    const item = makeReviewItem({ reason: "fingerprint_mismatch" });

    expect(evidenceSentence(item, t)).toBe(
      "The audio fingerprints as Artist X - Song Y, which scores 32 out of 100 for similarity against the track you requested."
    );
  });

  it("names an unnamed recording when the fingerprint carried no title", () => {
    const item = makeReviewItem({ reason: "fingerprint_mismatch", evidence: { title: null } });

    expect(evidenceSentence(item, t)).toContain("Artist X - an unnamed recording");
  });

  it("reports tag confidence against the threshold that rejected, not the similarity scale", () => {
    const item = makeReviewItem({
      reason: "tag_mismatch",
      evidence: { artist: null, title: null, score: null, observedConfidence: 34, expectedConfidence: 60 },
    });

    expect(evidenceSentence(item, t)).toBe(
      "The file tags scored 34 out of 100 for confidence, below the 60 this check requires."
    );
  });

  it("compares the two runtimes for a duration mismatch", () => {
    const item = makeReviewItem({
      reason: "duration_mismatch",
      evidence: {
        artist: null,
        title: null,
        score: null,
        observedDurationMs: 250_000,
        expectedDurationMs: 210_000,
      },
    });

    expect(evidenceSentence(item, t)).toBe("The audio runs 4:10 while the requested track runs 3:30.");
  });

  it("explains that nothing could be compared when the tags were unreadable", () => {
    const item = makeReviewItem({ reason: "tags_unreadable", evidence: { artist: null, title: null, score: null } });

    expect(evidenceSentence(item, t)).toBe(
      "The file tags could not be read, so nothing could be compared against the request."
    );
  });

  it("renders the legacy reasons as pre-evidence rejections", () => {
    const legacy = "This file was rejected before the granular checks started recording evidence.";

    expect(evidenceSentence(makeReviewItem({ reason: "wrong_file" }), t)).toBe(legacy);
    expect(evidenceSentence(makeReviewItem({ reason: "verify_failed" }), t)).toBe(legacy);
  });

  it("falls back to the unavailable sentence when the reason carries no evidence", () => {
    const item = makeReviewItem({ reason: "fingerprint_mismatch", evidence: { artist: null, score: null } });

    expect(evidenceSentence(item, t)).toBe("No evidence was recorded for this rejection.");
  });
});
