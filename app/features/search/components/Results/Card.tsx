"use client";

import { Badge } from "@components/ui/Badge";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { cn } from "@utils/cn";
import { scale } from "@utils/animations";
import { cardImagePlaceholder, cardHoverBorder, resultCard, cardInfo, cardTitle } from "../styles";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { CardProps } from "./types";
import { getSecondaryInfo, getTypeBadgeLabel, getTypeBadgeColors } from "./helpers";
import { ContentType } from "@api/__generated__/types";

export function Card({ result, onResultClick }: CardProps) {
  const [imageError, setImageError] = useState(false);
  const [comingSoonPlaylistConfirmation, setComingSoonPlaylistConfirmation] = useState(false);

  const handleCardClick = () => {
    if (result.type === ContentType.enum.playlist) {
      setComingSoonPlaylistConfirmation(true);
      return;
    }
    onResultClick(result.id, result.type);
  };

  const secondaryInfo = getSecondaryInfo(result);

  return (
    <motion.div
      onClick={handleCardClick}
      className={resultCard()}
      variants={scale}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      data-cy={`search-result-card-${result.type}`}
    >
      <div className="relative aspect-square">
        {result.image && !imageError ? (
          <Image
            src={result.image}
            alt={result.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={cardImagePlaceholder()}>
            <Music className="text-fg/20 h-20 w-20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="absolute top-2 left-2 z-10 sm:top-3 sm:left-3">
          <Badge className={cn("border font-semibold shadow-lg", getTypeBadgeColors(result.type))}>
            {getTypeBadgeLabel(result.type)}
          </Badge>
        </div>

        <div className={cardInfo()}>
          <h3 className={cardTitle()} data-cy="result-name">
            {result.name}
          </h3>
          {secondaryInfo && (
            <p className="text-overlay-fg-muted line-clamp-1 text-xs sm:text-sm" data-cy="result-info">
              {secondaryInfo}
            </p>
          )}
        </div>

        <div className={cardHoverBorder()} />
      </div>

      <ConfirmationModal
        isOpen={comingSoonPlaylistConfirmation}
        onClose={() => setComingSoonPlaylistConfirmation(false)}
        onConfirm={() => setComingSoonPlaylistConfirmation(false)}
        title="Coming Soon"
        message="Playlist requests will be available soon."
        confirmText="Got it"
        variant="info"
        showCancel={false}
      />
    </motion.div>
  );
}
