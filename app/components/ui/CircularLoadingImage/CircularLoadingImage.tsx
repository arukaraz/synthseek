"use client";

import Image from "next/image";
import { Music } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { isSpinningStatus, isProcessingStatus } from "@utils/status-helpers";
import { circularImagePlaceholder } from "../styles";
import { sizeConfig } from "./constants";
import type { CircularLoadingImageProps } from "./types";

export function CircularLoadingImage({ src, alt, status, size = "sm", className }: CircularLoadingImageProps) {
  const config = sizeConfig[size];
  const statusConfig = REQUEST_STATUS_CONFIG[status];
  const isSpinning = isSpinningStatus(status);
  const isActive = isProcessingStatus(status);

  return (
    <div className={cn("relative flex-shrink-0", config.container, className)}>
      {isActive && (
        <svg
          className={cn("absolute inset-0 -rotate-90", isSpinning && "animate-loading-ring", statusConfig.color)}
          viewBox={`0 0 ${config.image} ${config.image}`}
          fill="none"
        >
          <circle
            cx={config.image / 2}
            cy={config.image / 2}
            r={config.radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            strokeDasharray="75% 25%"
            strokeLinecap="round"
            className="opacity-80"
          />
        </svg>
      )}

      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full"
        animate={{ scale: isSpinning ? 0.75 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {src ? (
          <Image
            src={artworkProxySrc(src)}
            alt={alt}
            width={config.image}
            height={config.image}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className={circularImagePlaceholder()}>
            <Music className={cn("text-primary-400", config.iconSize)} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
