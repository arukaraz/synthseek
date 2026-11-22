import type { ActiveRelease, RequestListItem, TrackRequest } from "@api/__generated__/types";
import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";

import type { useRequestActions } from "../../hooks/useRequestActions";

export type TrackGroup = "done" | "active" | "review" | "failed" | "cancelled";

export type TrackGroupCounts = Record<TrackGroup, number>;

export interface TrackGroupStyle {
  fill: string;
}

export type TrackSortKey = "number" | "title" | "artist" | "status" | "source" | "completed";

export interface TrackSort {
  key: TrackSortKey;
  direction: "asc" | "desc";
}

export type TrackActionId =
  | "approve"
  | "reject"
  | "reimport"
  | "retry"
  | "requeue"
  | "prioritize"
  | "upgrade"
  | "stopWatch"
  | "resumeWatch"
  | "cancel";

export type TrackActionLock = "adminOnly" | "ownerOrAdmin";

export interface TrackAction {
  id: TrackActionId;
  lock: TrackActionLock | null;
}

export interface TrackActionPermissions {
  canManage: boolean;
  isAdmin: boolean;
}

export type BulkActionId = "retry" | "requeue" | "prioritize" | "upgrade" | "approve" | "reject" | "cancel";

export type TrackActionTone = "default" | "success" | "primary" | "danger";

export interface TrackActionMeta {
  icon: LucideIcon;
  labelKey: ParseKeys<"requests">;
  tone: TrackActionTone;
  bulk: BulkActionId | null;
}

export interface BulkActionMeta {
  icon: LucideIcon;
  labelKey: ParseKeys<"requests">;
}

export type BulkActionCounts = Record<BulkActionId, TrackRequest[]>;

export interface RequestDetailBodyProps {
  request: RequestListItem;
  tracks: TrackRequest[];
  isResolving: boolean;
  hasFailed: boolean;
  onRetryLoad: () => void;
}

export interface RequestDetailSummaryProps {
  request: RequestListItem;
  tracks: TrackRequest[];
  isResolving: boolean;
  filter: ReadonlySet<TrackGroup>;
  onToggleFilter: (group: TrackGroup) => void;
  onClearFilter: () => void;
}

export interface SummaryFilterChipProps {
  group: TrackGroup;
  count: number;
  active: boolean;
  dimmed: boolean;
  onToggle: (group: TrackGroup) => void;
}

export interface TrackSortNoteProps {
  sort: TrackSort;
  isPlaylist: boolean;
  onReset: () => void;
}

export interface TrackSortButtonProps {
  label: string;
  sortKey: TrackSortKey;
  sort: TrackSort | null;
  onSort: (key: TrackSortKey) => void;
}

export interface TrackDetailPanelProps {
  track: TrackRequest;
  showPrivateDetails: boolean;
}

export interface TrackDetailHeadProps {
  track: TrackRequest;
  release: ActiveRelease | null;
  showRawError: boolean;
}

export interface TrackRetryLineProps {
  track: TrackRequest;
}

export interface RequestDetailBulkBarProps {
  selected: TrackRequest[];
  permissions: TrackActionPermissions;
  onClear: () => void;
  onBulk: (id: BulkActionId, tracks: TrackRequest[]) => void;
}

export interface RequestDetailHeroMenuProps {
  actions: ReturnType<typeof useRequestActions>;
  typeLabel: string;
  onExportFull: () => void;
  onRejectPending: () => void;
  onRequestMissing: (() => void) | null;
  triggerClassName: string;
}

export interface RejectApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  onConfirm: (reason?: string) => void;
}

export interface RequestDetailProps {
  request: RequestListItem | null;
  onBack: () => void;
}

export interface TrackActionsCellProps {
  track: TrackRequest;
  actions: TrackAction[];
  onAction: (id: TrackActionId) => void;
}

export interface TrackTitleCellProps {
  track: TrackRequest;
  expanded: boolean;
  onToggle: () => void;
}

export interface TrackPriorityCellProps {
  track: TrackRequest;
}

export interface TrackStatusCellProps {
  track: TrackRequest;
}

export interface TrackProvenance {
  source: string;
  ref: string | null;
  license: string | null;
}

export interface TrackSourceCellProps {
  track: TrackRequest;
}

export interface RequestDetailHeroProps {
  request: RequestListItem;
  tracks: TrackRequest[];
  onBack: () => void;
}

export interface JspfExportDialogProps {
  request: RequestListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ReleaseProgressCardProps {
  release: ActiveRelease;
}

export interface RequestReleaseProgressProps {
  tracks: TrackRequest[];
}

export interface KeptReleaseNoticeProps {
  request: RequestListItem;
}

export interface ReleaseFigureFormat {
  size: (doneBytes: number, totalBytes: number) => string;
  eta: (minutes: number) => string;
}

export interface RequestDetailTracksProps {
  request: RequestListItem;
  tracks: TrackRequest[];
  visible: TrackRequest[];
  sort: TrackSort | null;
  onSort: (key: TrackSortKey) => void;
  selectedIds: ReadonlySet<string>;
  onSelectionChange: (ids: ReadonlySet<string>) => void;
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  permissions: TrackActionPermissions;
  onAction: (id: TrackActionId, track: TrackRequest) => void;
}
