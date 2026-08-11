import type { inferRouterOutputs } from "@trpc/server";

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

export interface ImportReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ReviewItemRowProps {
  item: ImportReviewItem;
}

export interface ReviewReasonBadgeProps {
  reason: ImportReviewReason;
}

export interface ReviewFooterProps {
  totalCount: number;
  totalBytes: number;
}
