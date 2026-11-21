import { FailureReason, RequestStatus } from "@api/__generated__/types";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileQuestion,
  FileX,
  HardDrive,
  Hourglass,
  Pause,
  PlayCircle,
  Search,
  Unplug,
  XCircle,
  type LucideIcon,
} from "lucide-react";

interface ReasonConfigItem {
  icon: LucideIcon;
}

interface StatusConfigItem {
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  reasons?: Record<FailureReason, ReasonConfigItem>;
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfigItem> = {
  [RequestStatus.enum.queued]: {
    icon: Clock,
    color: "text-status-queued",
    bgGradient: "from-status-queued/10 to-status-queued/5",
    borderColor: "border-status-queued/20",
    glowColor: "bg-status-queued",
  },
  [RequestStatus.enum.pending_approval]: {
    icon: Hourglass,
    color: "text-status-pending-approval",
    bgGradient: "from-status-pending-approval/10 to-status-pending-approval/5",
    borderColor: "border-status-pending-approval/20",
    glowColor: "bg-status-pending-approval",
  },
  [RequestStatus.enum.searching]: {
    icon: Search,
    color: "text-status-searching",
    bgGradient: "from-status-searching/10 to-status-searching/5",
    borderColor: "border-status-searching/20",
    glowColor: "bg-status-searching",
  },
  [RequestStatus.enum.pending_download]: {
    icon: Clock,
    color: "text-status-pending-download",
    bgGradient: "from-status-pending-download/10 to-status-pending-download/5",
    borderColor: "border-status-pending-download/20",
    glowColor: "bg-status-pending-download",
  },
  [RequestStatus.enum.downloading]: {
    icon: Download,
    color: "text-status-downloading",
    bgGradient: "from-status-downloading/10 to-status-downloading/5",
    borderColor: "border-status-downloading/20",
    glowColor: "bg-status-downloading",
  },
  [RequestStatus.enum.paused]: {
    icon: Pause,
    color: "text-status-paused",
    bgGradient: "from-status-paused/10 to-status-paused/5",
    borderColor: "border-status-paused/20",
    glowColor: "bg-status-paused",
  },
  [RequestStatus.enum.pending_import]: {
    icon: PlayCircle,
    color: "text-status-pending-import",
    bgGradient: "from-status-pending-import/10 to-status-pending-import/5",
    borderColor: "border-status-pending-import/20",
    glowColor: "bg-status-pending-import",
  },
  [RequestStatus.enum.importing]: {
    icon: PlayCircle,
    color: "text-status-importing",
    bgGradient: "from-status-importing/10 to-status-importing/5",
    borderColor: "border-status-importing/20",
    glowColor: "bg-status-importing",
  },
  [RequestStatus.enum.complete]: {
    icon: CheckCircle,
    color: "text-status-complete",
    bgGradient: "from-status-complete/10 to-status-complete/5",
    borderColor: "border-status-complete/20",
    glowColor: "bg-status-complete",
  },
  [RequestStatus.enum.failed]: {
    icon: XCircle,
    color: "text-status-failed",
    bgGradient: "from-status-failed/10 to-status-failed/5",
    borderColor: "border-status-failed/20",
    glowColor: "bg-status-failed",
    reasons: {
      [FailureReason.enum.not_found]: {
        icon: FileQuestion,
      },
      [FailureReason.enum.import_rejected]: {
        icon: FileX,
      },
      [FailureReason.enum.wrong_file]: {
        icon: FileX,
      },
      [FailureReason.enum.p2p_failed]: {
        icon: Unplug,
      },
      [FailureReason.enum.download_failed]: {
        icon: Download,
      },
      [FailureReason.enum.environment]: {
        icon: HardDrive,
      },
      [FailureReason.enum.timeout]: {
        icon: Hourglass,
      },
      [FailureReason.enum.other]: {
        icon: AlertCircle,
      },
    },
  },
  [RequestStatus.enum.in_progress]: {
    icon: Download,
    color: "text-status-in-progress",
    bgGradient: "from-status-in-progress/10 to-status-in-progress/5",
    borderColor: "border-status-in-progress/20",
    glowColor: "bg-status-in-progress",
  },
  [RequestStatus.enum.syncing_plex]: {
    icon: PlayCircle,
    color: "text-status-syncing",
    bgGradient: "from-status-syncing/10 to-status-syncing/5",
    borderColor: "border-status-syncing/20",
    glowColor: "bg-status-syncing",
  },
  [RequestStatus.enum.partially_complete]: {
    icon: CheckCircle,
    color: "text-status-partial",
    bgGradient: "from-status-partial/10 to-status-partial/5",
    borderColor: "border-status-partial/20",
    glowColor: "bg-status-partial",
  },
  [RequestStatus.enum.cancelled]: {
    icon: XCircle,
    color: "text-status-cancelled",
    bgGradient: "from-status-cancelled/10 to-status-cancelled/5",
    borderColor: "border-status-cancelled/20",
    glowColor: "bg-status-cancelled",
  },
  [RequestStatus.enum.delegated]: {
    icon: ExternalLink,
    color: "text-status-delegated",
    bgGradient: "from-status-delegated/10 to-status-delegated/5",
    borderColor: "border-status-delegated/20",
    glowColor: "bg-status-delegated",
  },
};
