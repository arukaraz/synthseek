import type { ParseKeys, TFunction } from "i18next";

import { formatTrackDuration } from "@utils/formatters";

import {
  HELD_IMPORT_ERROR_KEYS,
  RETENTION_MAX_DAYS,
  RETENTION_MIN_DAYS,
  REVIEW_AUDIO_PATH_PREFIX,
  REVIEW_AUDIO_PATH_SUFFIX,
} from "./constants";
import type { HeldImportErrorToken, ImportReviewItem } from "./types";

export function heldAudioUrl(heldImportId: string): string {
  return `${REVIEW_AUDIO_PATH_PREFIX}${encodeURIComponent(heldImportId)}${REVIEW_AUDIO_PATH_SUFFIX}`;
}

export function parseRetentionDays(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) return null;
  if (parsed < RETENTION_MIN_DAYS || parsed > RETENTION_MAX_DAYS) return null;

  return parsed;
}

function isHeldImportErrorToken(value: string): value is HeldImportErrorToken {
  return Object.prototype.hasOwnProperty.call(HELD_IMPORT_ERROR_KEYS, value);
}

export function heldImportErrorKey(error: string): ParseKeys<"requests"> {
  return isHeldImportErrorToken(error) ? HELD_IMPORT_ERROR_KEYS[error] : "review.error.unknown";
}

export function evidenceSentence(item: ImportReviewItem, t: TFunction<"requests">): string {
  const { evidence } = item;

  switch (item.reason) {
    case "fingerprint_mismatch":
      if (evidence.artist === null || evidence.score === null) break;
      return t("review.evidence.fingerprintMismatch", {
        artist: evidence.artist,
        title: evidence.title ?? t("review.evidence.unknownTitle"),
        score: Math.round(evidence.score),
      });
    case "tag_mismatch":
      if (evidence.observedConfidence === null || evidence.expectedConfidence === null) break;
      return t("review.evidence.tagMismatch", {
        observed: Math.round(evidence.observedConfidence),
        expected: Math.round(evidence.expectedConfidence),
      });
    case "duration_mismatch":
      if (evidence.observedDurationMs === null || evidence.expectedDurationMs === null) break;
      return t("review.evidence.durationMismatch", {
        observed: formatTrackDuration(evidence.observedDurationMs),
        expected: formatTrackDuration(evidence.expectedDurationMs),
      });
    case "tags_unreadable":
      return t("review.evidence.tagsUnreadable");
    case "wrong_file":
    case "verify_failed":
      return t("review.evidence.legacy");
  }

  return t("review.evidence.unavailable");
}
