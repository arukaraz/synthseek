import type { ParseKeys } from "i18next";

import type { VariantProps } from "class-variance-authority";

import type { reasonBadge } from "./styles";
import type { HeldImportErrorToken, ImportReviewReason } from "./types";

export type ReasonBadgeTone = NonNullable<VariantProps<typeof reasonBadge>["tone"]>;

export const REVIEW_AUDIO_PATH_PREFIX = "/api/v1/review/";

export const REVIEW_AUDIO_PATH_SUFFIX = "/audio";

export const RETENTION_INPUT_ID = "import-review-retention-days";

export const RETENTION_ERROR_ID = "import-review-retention-days-error";

export const RETENTION_MIN_DAYS = 1;

export const RETENTION_MAX_DAYS = 365;

export const REVIEW_REASON_KEYS: Record<ImportReviewReason, ParseKeys<"settings">> = {
  wrong_file: "quarantine.reason.wrong_file",
  verify_failed: "quarantine.reason.verify_failed",
  fingerprint_mismatch: "quarantine.reason.fingerprint_mismatch",
  tag_mismatch: "quarantine.reason.tag_mismatch",
  duration_mismatch: "quarantine.reason.duration_mismatch",
  tags_unreadable: "quarantine.reason.tags_unreadable",
};

export const REVIEW_REASON_TONES: Record<ImportReviewReason, ReasonBadgeTone> = {
  wrong_file: "neutral",
  verify_failed: "neutral",
  fingerprint_mismatch: "danger",
  tag_mismatch: "warning",
  duration_mismatch: "warning",
  tags_unreadable: "info",
};

export const HELD_IMPORT_ERROR_KEYS: Record<HeldImportErrorToken, ParseKeys<"requests">> = {
  heldFileMissingAfterRestart: "review.error.heldFileMissingAfterRestart",
  heldFileMissing: "review.error.heldFileMissing",
  importFailedBeforeMove: "review.error.importFailedBeforeMove",
  importFailedAfterMove: "review.error.importFailedAfterMove",
};
