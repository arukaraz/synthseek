"use client";

import { ContentType, type MusicTrack } from "@api/__generated__/types";
import { ImageWithFallback } from "@components/ImageWithFallback/ImageWithFallback";
import { RequestSplitButton } from "@components/RequestSplitButton";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { ConfigRequestModal } from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { fadeIn } from "@utils/animations";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { trendingArtist, trendingTitle } from "./helpers";
import {
  heroCanvas,
  heroContent,
  heroImageOverlayBottom,
  heroImageOverlayLeft,
  heroInfo,
  heroSubtitle,
  heroTitle,
  heroTrendingBadge,
} from "./styles";
import type { TrendingHeroSlideProps } from "./types";

export function TrendingHeroSlide({ item, onRequestOpenChange, info }: TrendingHeroSlideProps) {
  const { t } = useTranslation("discover");
  const [requestedTrack, setRequestedTrack] = useState<MusicTrack | null>(null);
  const { requestResult } = useContentRequestFlow();
  const track = item.track;
  const trackName = trendingTitle(track);
  const artistName = trendingArtist(track);
  const imageUrl = track.images?.[0]?.url ?? null;

  const handleRequest = useCallback(() => requestResult(track, "direct"), [requestResult, track]);

  const handleCustomize = useCallback(() => {
    setRequestedTrack(track);
    onRequestOpenChange(true);
  }, [track, onRequestOpenChange]);

  const handleClose = useCallback(() => {
    setRequestedTrack(null);
    onRequestOpenChange(false);
  }, [onRequestOpenChange]);

  return (
    <>
      <div className={heroCanvas()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={track.id}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0"
          >
            <ImageWithFallback
              src={imageUrl}
              alt={t("trendingHero.coverAlt", { title: trackName, artist: artistName })}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="rounded-2xl object-cover"
              priority
            />
            <div className={heroImageOverlayBottom()} />
            <div className={heroImageOverlayLeft()} />
          </motion.div>
        </AnimatePresence>

        <div className={heroTrendingBadge()}>
          <Zap className="h-3 w-3" /> {t("trendingHero.badge")}
          <InfoTooltip title={t("trendingHero.badge")} description={info} className={heroInfo()} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${track.id}-text`}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={heroContent()}
          >
            <h2 className={heroTitle()}>{trackName}</h2>
            <p className={heroSubtitle()}>{artistName}</p>
            <RequestSplitButton
              name={trackName}
              label={t("trendingHero.request")}
              size="sm"
              onRequest={handleRequest}
              onCustomize={handleCustomize}
              dataCy="trending-hero-request"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {requestedTrack && (
        <ConfigRequestModal
          isOpen
          item={requestedTrack}
          itemType={ContentType.enum.track}
          onClose={handleClose}
          parentAlbum={null}
        />
      )}
    </>
  );
}
