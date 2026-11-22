import type { ParseKeys, TFunction } from "i18next";

import { QuarantineReason } from "@api/__generated__/types";
import type { PreviewClip } from "@hooks/ui/trackPreview";
import { formatTrackDuration } from "@utils/formatters";
import { foldText } from "@utils/search";

import {
  HELD_IMPORT_ERROR_KEYS,
  RETENTION_MAX_DAYS,
  RETENTION_MIN_DAYS,
  REVIEW_AUDIO_PATH_PREFIX,
  REVIEW_AUDIO_PATH_SUFFIX,
  REVIEW_CLIP_KEY_PREFIX,
  REVIEW_TRACK_ANCHOR_PREFIX,
} from "./constants";
import type {
  DiffToken,
  HeldImportErrorToken,
  ImportReviewItem,
  ReasonCount,
  ReasonFilter,
  ReviewComparison,
  ReviewRequestGroup,
  WordDiff,
} from "./types";

export function reviewTrackAnchor(trackId: string): string {
  return `${REVIEW_TRACK_ANCHOR_PREFIX}${trackId}`;
}

export function countReasons(items: readonly ImportReviewItem[]): ReasonCount[] {
  return QuarantineReason.options
    .map((reason) => ({ reason, count: items.filter((item) => item.reason === reason).length }))
    .filter((entry) => entry.count > 0);
}

export function groupReviewItems(items: readonly ImportReviewItem[], filter: ReasonFilter): ReviewRequestGroup[] {
  const groups: ReviewRequestGroup[] = [];

  for (const item of items) {
    const requestKey = `${item.request.contentType}:${item.request.id}`;
    let group = groups.find((entry) => `${entry.request.contentType}:${entry.request.id}` === requestKey);
    if (!group) {
      group = { request: item.request, tracks: [] };
      groups.push(group);
    }

    let track = group.tracks.find((entry) => entry.track.id === item.track.id);
    if (!track) {
      track = { track: item.track, items: [], shown: [] };
      group.tracks.push(track);
    }

    track.items.push(item);
    if (filter === "all" || item.reason === filter) track.shown.push(item);
  }

  return groups
    .map((group) => ({ ...group, tracks: group.tracks.filter((track) => track.shown.length > 0) }))
    .filter((group) => group.tracks.length > 0);
}

function diffSide(words: readonly string[], other: ReadonlySet<string>): DiffToken[] {
  return words.map((text) => {
    const folded = foldText(text);
    return { text, changed: folded.length > 0 && !other.has(folded) };
  });
}

function splitWords(value: string): string[] {
  return value.split(" ").filter((word) => word.length > 0);
}

export function wordDiff(requested: string, found: string): WordDiff {
  const requestedWords = splitWords(requested);
  const foundWords = splitWords(found);
  const requestedSet = new Set(requestedWords.map(foldText));
  const foundSet = new Set(foundWords.map(foldText));
  const requestedTokens = diffSide(requestedWords, foundSet);
  const foundTokens = diffSide(foundWords, requestedSet);

  return {
    requested: requestedTokens,
    found: foundTokens,
    differs: requestedTokens.some((token) => token.changed) || foundTokens.some((token) => token.changed),
  };
}

export function comparisonOf(item: ImportReviewItem): ReviewComparison | null {
  const { evidence } = item;

  switch (item.reason) {
    case "fingerprint_mismatch":
      return evidence.artist === null
        ? null
        : { kind: "fingerprint", artist: evidence.artist, title: evidence.title, score: evidence.score };
    case "duration_mismatch":
      return evidence.observedDurationMs === null || evidence.expectedDurationMs === null
        ? null
        : { kind: "duration", observedMs: evidence.observedDurationMs, expectedMs: evidence.expectedDurationMs };
    case "tag_mismatch":
      return evidence.observedConfidence === null || evidence.expectedConfidence === null
        ? null
        : { kind: "tagMatch", observed: evidence.observedConfidence, expected: evidence.expectedConfidence };
    case "tags_unreadable":
      return { kind: "unreadable" };
    case "rejected_recording":
      return evidence.rejectedPath === null ? null : { kind: "rejected", path: evidence.rejectedPath };
    case "wrong_file":
    case "verify_failed":
      return null;
  }
}

export function durationDelta(observedMs: number, expectedMs: number): string {
  const delta = observedMs - expectedMs;
  return `${delta >= 0 ? "+" : "-"}${formatTrackDuration(Math.abs(delta))}`;
}

export function heldAudioUrl(heldImportId: string): string {
  return `${REVIEW_AUDIO_PATH_PREFIX}${encodeURIComponent(heldImportId)}${REVIEW_AUDIO_PATH_SUFFIX}`;
}

export function heldFileClip(heldImportId: string, title: string): PreviewClip {
  return {
    key: `${REVIEW_CLIP_KEY_PREFIX}${heldImportId}`,
    subject: "file",
    src: heldAudioUrl(heldImportId),
    title,
    fallbackSeconds: null,
  };
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
    case "rejected_recording":
      if (evidence.rejectedPath === null) break;
      return t("review.evidence.rejectedRecording", { path: evidence.rejectedPath });
    case "wrong_file":
    case "verify_failed":
      return t("review.evidence.legacy");
  }

  return t("review.evidence.unavailable");
}
