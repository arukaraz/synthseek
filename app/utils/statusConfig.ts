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
    color: "text-orange-400",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    borderColor: "border-orange-500/20",
    glowColor: "bg-orange-500",
  },
  [RequestStatus.enum.searching]: {
    icon: Search,
    color: "text-secondary-400",
    bgGradient: "from-secondary-500/10 to-secondary-600/5",
    borderColor: "border-secondary-500/20",
    glowColor: "bg-secondary-500",
  },
  [RequestStatus.enum.pending_download]: {
    icon: Clock,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
  },
  [RequestStatus.enum.downloading]: {
    icon: Download,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
  },
  [RequestStatus.enum.paused]: {
    icon: Pause,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/10 to-yellow-600/5",
    borderColor: "border-yellow-500/20",
    glowColor: "bg-yellow-500",
  },
  [RequestStatus.enum.pending_import]: {
    icon: PlayCircle,
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/10 to-indigo-600/5",
    borderColor: "border-indigo-500/20",
    glowColor: "bg-indigo-500",
  },
  [RequestStatus.enum.importing]: {
    icon: PlayCircle,
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/10 to-indigo-600/5",
    borderColor: "border-indigo-500/20",
    glowColor: "bg-indigo-500",
  },
  [RequestStatus.enum.complete]: {
    icon: CheckCircle,
    color: "text-green-400",
    bgGradient: "from-green-500/10 to-green-600/5",
    borderColor: "border-green-500/20",
    glowColor: "bg-green-500",
  },
  [RequestStatus.enum.failed]: {
    icon: XCircle,
    color: "text-red-400",
    bgGradient: "from-red-500/10 to-red-600/5",
    borderColor: "border-red-500/20",
    glowColor: "bg-red-500",
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
      [FailureReason.enum.other]: {
        icon: AlertCircle,
      },
    },
  },
  [RequestStatus.enum.in_progress]: {
    icon: Download,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
  },
  [RequestStatus.enum.syncing_plex]: {
    icon: PlayCircle,
    color: "text-sync",
    bgGradient: "from-sync/10 to-sync/5",
    borderColor: "border-sync/20",
    glowColor: "bg-sync",
  },
  [RequestStatus.enum.partially_complete]: {
    icon: CheckCircle,
    color: "text-amber-400",
    bgGradient: "from-amber-500/10 to-amber-600/5",
    borderColor: "border-amber-500/20",
    glowColor: "bg-amber-500",
  },
  [RequestStatus.enum.cancelled]: {
    icon: XCircle,
    color: "text-gray-400",
    bgGradient: "from-gray-500/10 to-gray-600/5",
    borderColor: "border-gray-500/20",
    glowColor: "bg-gray-500",
  },
  [RequestStatus.enum.delegated]: {
    icon: ExternalLink,
    color: "text-secondary-400",
    bgGradient: "from-secondary-500/10 to-secondary-600/5",
    borderColor: "border-secondary-500/20",
    glowColor: "bg-secondary-500",
  },
};
