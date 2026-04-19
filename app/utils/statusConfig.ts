import { RequestStatus } from "@api/__generated__/types";
import { CheckCircle, Clock, Download, Pause, PlayCircle, Search, XCircle, type LucideIcon } from "lucide-react";

interface StatusConfigItem {
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  label: string;
  description: string;
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfigItem> = {
  [RequestStatus.enum.queued]: {
    icon: Clock,
    color: "text-orange-400",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    borderColor: "border-orange-500/20",
    glowColor: "bg-orange-500",
    label: "Queued",
    description: "Waiting in queue",
  },
  [RequestStatus.enum.searching]: {
    icon: Search,

    color: "text-secondary-400",
    bgGradient: "from-secondary-500/10 to-secondary-600/5",
    borderColor: "border-secondary-500/20",
    glowColor: "bg-secondary-500",
    label: "Searching",
    description: "Finding sources",
  },
  [RequestStatus.enum.pending_download]: {
    icon: Clock,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
    label: "Pending Download",
    description: "Awaiting download",
  },
  [RequestStatus.enum.downloading]: {
    icon: Download,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
    label: "Downloading",
    description: "In progress",
  },
  [RequestStatus.enum.paused]: {
    icon: Pause,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/10 to-yellow-600/5",
    borderColor: "border-yellow-500/20",
    glowColor: "bg-yellow-500",
    label: "Paused",
    description: "Download paused",
  },
  [RequestStatus.enum.pending_import]: {
    icon: PlayCircle,
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/10 to-indigo-600/5",
    borderColor: "border-indigo-500/20",
    glowColor: "bg-indigo-500",
    label: "Pending Import",
    description: "Awaiting import",
  },
  [RequestStatus.enum.importing]: {
    icon: PlayCircle,
    color: "text-indigo-400",
    bgGradient: "from-indigo-500/10 to-indigo-600/5",
    borderColor: "border-indigo-500/20",
    glowColor: "bg-indigo-500",
    label: "Importing",
    description: "Processing file",
  },
  [RequestStatus.enum.complete]: {
    icon: CheckCircle,
    color: "text-green-400",
    bgGradient: "from-green-500/10 to-green-600/5",
    borderColor: "border-green-500/20",
    glowColor: "bg-green-500",
    label: "Complete",
    description: "Download complete",
  },
  [RequestStatus.enum.failed]: {
    icon: XCircle,
    color: "text-red-400",
    bgGradient: "from-red-500/10 to-red-600/5",
    borderColor: "border-red-500/20",
    glowColor: "bg-red-500",
    label: "Failed",
    description: "Download failed",
  },
  [RequestStatus.enum.in_progress]: {
    icon: Download,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
    label: "In Progress",
    description: "Downloading tracks",
  },
  [RequestStatus.enum.syncing_plex]: {
    icon: PlayCircle,
    color: "text-primary-400",
    bgGradient: "from-primary-500/10 to-primary-600/5",
    borderColor: "border-primary-500/20",
    glowColor: "bg-primary-500",
    label: "Syncing to Plex",
    description: "Syncing to Plex…",
  },
  [RequestStatus.enum.partially_complete]: {
    icon: CheckCircle,
    color: "text-amber-400",
    bgGradient: "from-amber-500/10 to-amber-600/5",
    borderColor: "border-amber-500/20",
    glowColor: "bg-amber-500",
    label: "Partially Complete",
    description: "Some tracks failed",
  },
  [RequestStatus.enum.cancelled]: {
    icon: XCircle,
    color: "text-gray-400",
    bgGradient: "from-gray-500/10 to-gray-600/5",
    borderColor: "border-gray-500/20",
    glowColor: "bg-gray-500",
    label: "Cancelled",
    description: "Download cancelled",
  },
};
