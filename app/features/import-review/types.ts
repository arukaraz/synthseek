import type { inferRouterOutputs } from "@trpc/server";
import type { ReactNode } from "react";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ImportReviewList = RouterOutputs["requests"]["review"]["list"];
export type ImportReviewItem = ImportReviewList["items"][number];
export type ImportReviewEvidence = ImportReviewItem["evidence"];
export type ImportReviewReason = ImportReviewItem["reason"];

export type HeldImportErrorToken =
  | "heldFileMissingAfterRestart"
  | "heldFileMissing"
  | "importFailedBeforeMove"
  | "importFailedAfterMove";

export type ImportReviewTrack = ImportReviewItem["track"];
export type ImportReviewRequest = ImportReviewItem["request"];

export type ReasonFilter = ImportReviewReason | "all";

export interface ReasonCount {
  reason: ImportReviewReason;
  count: number;
}

export interface ReviewTrackGroup {
  track: ImportReviewTrack;
  items: ImportReviewItem[];
  shown: ImportReviewItem[];
}

export interface ReviewRequestGroup {
  request: ImportReviewRequest;
  tracks: ReviewTrackGroup[];
}

export interface DiffToken {
  text: string;
  changed: boolean;
}

export interface WordDiff {
  requested: DiffToken[];
  found: DiffToken[];
  differs: boolean;
}

export interface ImportReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  focusTrackId: string | null;
}

export interface ReviewReasonChipsProps {
  counts: ReasonCount[];
  total: number;
  active: ReasonFilter;
  onChange: (filter: ReasonFilter) => void;
}

export interface ReviewRequestGroupProps {
  group: ReviewRequestGroup;
}

export interface ReviewTrackCardProps {
  group: ReviewTrackGroup;
}

export interface ReviewCandidateProps {
  item: ImportReviewItem;
  index: number;
  siblings: number;
}

export interface ReviewCompareTableProps {
  item: ImportReviewItem;
}

export type ReviewComparison =
  | { kind: "fingerprint"; artist: string; title: string | null; score: number | null }
  | { kind: "duration"; observedMs: number; expectedMs: number }
  | { kind: "tagMatch"; observed: number; expected: number }
  | { kind: "unreadable" }
  | { kind: "rejected"; path: string };

export interface ReviewCompareRowsProps {
  comparison: ReviewComparison;
  track: ImportReviewTrack;
}

export interface CompareRowProps {
  label: string;
  requested: ReactNode;
  found: ReactNode;
  differs: boolean;
}

export interface SimilarityMeterProps {
  label: string;
  score: number;
  caption: string;
}

export interface DiffTextProps {
  tokens: DiffToken[];
  side: "requested" | "found";
}

export interface ReviewReasonBadgeProps {
  reason: ImportReviewReason;
}

export interface ReviewFooterProps {
  totalCount: number;
  totalBytes: number;
}
