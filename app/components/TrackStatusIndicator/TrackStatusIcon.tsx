"use client";

import { RequestStatus } from "@api/__generated__/types";
import { LoadingRing } from "@components/ui/LoadingRing";
import { cn } from "@utils/cn";
import { isProcessingStatus, isSpinningStatus } from "@utils/status-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import type { TrackStatusIconProps } from "./types";

export function TrackStatusIcon({ status }: TrackStatusIconProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[status];
  const isActive = isProcessingStatus(status);
  const isSpinning = isSpinningStatus(status);
  const Icon = status === RequestStatus.enum.failed ? X : statusConfig.icon;

  return (
    <div className="relative size-5 shrink-0">
      {isActive && <LoadingRing spinning={isSpinning} className={cn("opacity-80", statusConfig.color)} />}
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
