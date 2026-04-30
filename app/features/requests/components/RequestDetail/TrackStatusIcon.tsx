"use client";

import { RequestStatus } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { isProcessingStatus, isSpinningStatus } from "@utils/status-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  TRACK_STATUS_ICON_CONTAINER_SIZE,
  TRACK_STATUS_ICON_RADIUS,
  TRACK_STATUS_ICON_STROKE_WIDTH,
} from "./consts";
import type { TrackStatusIconProps } from "./types";

export function TrackStatusIcon({ status }: TrackStatusIconProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[status];
  const isActive = isProcessingStatus(status);
  const isSpinning = isSpinningStatus(status);
  const Icon = status === RequestStatus.enum.failed ? X : statusConfig.icon;

  return (
    <div className="relative size-5 shrink-0">
      {isActive && (
        <svg
          className={cn("absolute inset-0 -rotate-90", isSpinning && "animate-loading-ring", statusConfig.color)}
          viewBox={`0 0 ${TRACK_STATUS_ICON_CONTAINER_SIZE} ${TRACK_STATUS_ICON_CONTAINER_SIZE}`}
          fill="none"
          aria-hidden
        >
          <circle
            cx={TRACK_STATUS_ICON_CONTAINER_SIZE / 2}
            cy={TRACK_STATUS_ICON_CONTAINER_SIZE / 2}
            r={TRACK_STATUS_ICON_RADIUS}
            stroke="currentColor"
            strokeWidth={TRACK_STATUS_ICON_STROKE_WIDTH}
            strokeDasharray="75% 25%"
            strokeLinecap="round"
            className="opacity-80"
          />
        </svg>
      )}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: isSpinning ? 0.7 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Icon className={cn("size-3", statusConfig.color)} aria-hidden />
      </motion.div>
    </div>
  );
}
