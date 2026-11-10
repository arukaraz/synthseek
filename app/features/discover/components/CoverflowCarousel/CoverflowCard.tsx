"use client";

import { ContentType } from "@api/__generated__/types";
import { ImageWithFallback } from "@components/ImageWithFallback/ImageWithFallback";
import { RequestSplitButton } from "@components/RequestSplitButton";
import { ConfigRequestModal } from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { trendingBadgeContainer, cardBottomContentLg } from "../styles";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import type { CoverflowCardProps } from "./types";

export const CoverflowCard = memo(function CoverflowCard({
  imageUrl,
  track,
  transform,
  isCenter,
  index,
  onClick,
  priority = false,
}: CoverflowCardProps) {
  const { t } = useTranslation("discover");
  const { translateX, rotateY, scale, opacity, zIndex } = transform;
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { requestResult } = useContentRequestFlow();

  const trackName = track?.title ?? t("coverflow.unknownTrack");
  const artistName = track?.artists?.[0]?.name ?? t("coverflow.unknownArtist");

  const handleClick = useCallback(() => {
    if (!isCenter) onClick(index);
  }, [isCenter, onClick, index]);

  const currentZIndex = isHovered && isCenter ? 200 : zIndex;
  const currentScale = isHovered && isCenter ? scale * 1.02 : scale;
  const currentOpacity = isCenter ? 1 : opacity;

  return (
    <motion.div
      className={cn(
        "absolute top-1/2 left-1/2 overflow-hidden rounded-xl shadow-2xl sm:rounded-2xl",
        "h-[80vw] w-[80vw] sm:h-70 sm:w-70 lg:h-[450px] lg:w-[450px]",
        isCenter ? "cursor-default" : "cursor-pointer"
      )}
      initial={false}
      animate={{
        x: "-50%",
        y: "-50%",
        translateX,
        rotateY,
        scale: currentScale,
        opacity: currentOpacity,
        zIndex: currentZIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 50,
        mass: 1,
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl sm:rounded-2xl",
          isCenter && "ring-primary-500/60 ring-2"
        )}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={t("coverflow.coverAlt", { title: trackName, artist: artistName })}
          fill
          sizes="(max-width: 640px) 55vw, (max-width: 1024px) 40vw, 35vw"
          className="rounded-xl sm:rounded-2xl"
          priority={priority}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-black/20" />

        {isCenter && (
          <div className={trendingBadgeContainer()}>
            <TrendingUp className="text-overlay-fg-accent h-5 w-5" />
            <span className="text-overlay-fg/90 text-lg font-medium">{t("coverflow.badge")}</span>
          </div>
        )}

        <div className={cardBottomContentLg()}>
          <h3
            className={cn(
              "text-overlay-fg line-clamp-2 leading-tight font-bold",
              isCenter ? "mb-0.5 text-base sm:mb-1 sm:text-xl lg:text-2xl" : "mb-0.5 text-xs sm:text-sm lg:text-base"
            )}
          >
            {trackName}
          </h3>
          <p
            className={cn(
              "text-overlay-fg/70 line-clamp-1",
              isCenter ? "text-xs sm:text-sm lg:text-base" : "text-[10px] sm:text-xs lg:text-sm"
            )}
          >
            {artistName}
          </p>

          {isCenter && track ? (
            <RequestSplitButton
              name={trackName}
              label={t("coverflow.download")}
              size="sm"
              className="mt-2 sm:mt-3"
              onRequest={() => requestResult(track, "direct")}
              onCustomize={() => setShowModal(true)}
            />
          ) : null}
        </div>
      </div>

      {showModal &&
        createPortal(
          <ConfigRequestModal
            isOpen={showModal}
            item={track}
            itemType={ContentType.enum.track}
            onClose={() => setShowModal(false)}
            parentAlbum={null}
          />,
          document.body
        )}
    </motion.div>
  );
});
