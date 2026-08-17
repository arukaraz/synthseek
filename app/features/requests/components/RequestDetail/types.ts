import type { RequestListItem, TrackRequest } from "@api/__generated__/types";

import type { useRequestActions } from "../../hooks/useRequestActions";

export interface RequestDetailHeroMenuProps {
  actions: ReturnType<typeof useRequestActions>;
  typeLabel: string;
  onExportFull: () => void;
  onRejectPending: () => void;
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
  canAct: boolean;
  canApprove: boolean;
  onRetry: () => void;
  onCancel: () => void;
  onPrioritize: () => void;
  onSetWatch: (enabled: boolean) => void;
  onApprove: () => void;
  onReject: () => void;
  onUpgrade: () => void;
}

export interface TrackTitleCellProps {
  track: TrackRequest;
}

export interface TrackPriorityCellProps {
  track: TrackRequest;
}

export interface TrackStatusCellProps {
  track: TrackRequest;
  onRetryNow?: () => void;
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

export interface RequestDetailStatsProps {
  request: RequestListItem;
  tracks: TrackRequest[];
  isResolving: boolean;
}

export interface RequestDetailStatsCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  valueClassName?: string;
}

export interface RequestDetailTracksProps {
  request: RequestListItem;
  tracks: TrackRequest[];
  isResolving: boolean;
  hasFailed: boolean;
  onRetryLoad: () => void;
}
