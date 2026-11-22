import { RequestStatus } from "@api/__generated__/types";
import { Check, ChevronsUp, Eye, EyeOff, FileInput, ListPlus, RefreshCw, Sparkles, X } from "lucide-react";

import type {
  BulkActionId,
  BulkActionMeta,
  TrackActionId,
  TrackActionMeta,
  TrackGroup,
  TrackGroupStyle,
  TrackSortKey,
} from "./types";

export const TRACK_ACTION_META: Record<TrackActionId, TrackActionMeta> = {
  approve: { icon: Check, labelKey: "trackActions.approve", tone: "success", bulk: "approve" },
  reject: { icon: X, labelKey: "trackActions.reject", tone: "danger", bulk: "reject" },
  reimport: { icon: FileInput, labelKey: "trackActions.reimport", tone: "success", bulk: "retry" },
  retry: { icon: RefreshCw, labelKey: "trackActions.retry", tone: "success", bulk: "retry" },
  requeue: { icon: ListPlus, labelKey: "trackActions.requeue", tone: "success", bulk: "requeue" },
  prioritize: { icon: ChevronsUp, labelKey: "trackActions.prioritize", tone: "primary", bulk: "prioritize" },
  upgrade: { icon: Sparkles, labelKey: "trackActions.upgrade", tone: "default", bulk: "upgrade" },
  stopWatch: { icon: EyeOff, labelKey: "trackActions.stopWatch", tone: "default", bulk: null },
  resumeWatch: { icon: Eye, labelKey: "trackActions.resumeWatch", tone: "default", bulk: null },
  cancel: { icon: X, labelKey: "trackActions.cancel", tone: "danger", bulk: "cancel" },
};

export const BULK_ACTION_ORDER: readonly BulkActionId[] = [
  "retry",
  "requeue",
  "prioritize",
  "upgrade",
  "approve",
  "reject",
  "cancel",
];

export const BULK_ACTION_META: Record<BulkActionId, BulkActionMeta> = {
  retry: { icon: RefreshCw, labelKey: "bulk.retry" },
  requeue: { icon: ListPlus, labelKey: "bulk.requeue" },
  prioritize: { icon: ChevronsUp, labelKey: "bulk.prioritize" },
  upgrade: { icon: Sparkles, labelKey: "bulk.upgrade" },
  approve: { icon: Check, labelKey: "bulk.approve" },
  reject: { icon: X, labelKey: "bulk.reject" },
  cancel: { icon: X, labelKey: "bulk.cancel" },
};

export const TRACK_GROUP_BY_STATUS: Record<RequestStatus, TrackGroup> = {
  [RequestStatus.enum.complete]: "done",
  [RequestStatus.enum.queued]: "active",
  [RequestStatus.enum.in_progress]: "active",
  [RequestStatus.enum.searching]: "active",
  [RequestStatus.enum.pending_download]: "active",
  [RequestStatus.enum.downloading]: "active",
  [RequestStatus.enum.paused]: "active",
  [RequestStatus.enum.pending_import]: "active",
  [RequestStatus.enum.importing]: "active",
  [RequestStatus.enum.syncing_plex]: "active",
  [RequestStatus.enum.delegated]: "active",
  [RequestStatus.enum.pending_approval]: "review",
  [RequestStatus.enum.pending_import_review]: "review",
  [RequestStatus.enum.failed]: "failed",
  [RequestStatus.enum.partially_complete]: "failed",
  [RequestStatus.enum.cancelled]: "cancelled",
};

export const TRACK_GROUP_ORDER: readonly TrackGroup[] = ["done", "active", "review", "failed", "cancelled"];

export const TRACK_GROUP_STYLE: Record<TrackGroup, TrackGroupStyle> = {
  done: { fill: "bg-status-complete" },
  active: { fill: "bg-status-downloading" },
  review: { fill: "bg-status-pending-approval" },
  failed: { fill: "bg-status-failed" },
  cancelled: { fill: "bg-status-cancelled" },
};

export const TRACK_SORT_KEYS: readonly TrackSortKey[] = ["number", "title", "artist", "status", "source", "completed"];
