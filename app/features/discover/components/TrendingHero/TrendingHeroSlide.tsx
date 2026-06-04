"use client";

import { ContentType } from "@api/__generated__/types";
import { ImageWithFallback } from "@components/ui/ImageWithFallback/ImageWithFallback";
import { ConfigRequestModal } from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { primaryGradientButton } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  heroCanvas,
  heroContent,
  heroImageOverlayBottom,
  heroImageOverlayLeft,
  heroSubtitle,
  heroTitle,
  heroTrendingBadge,
} from "./styles";
import type { TrendingHeroSlideProps } from "./types";

export function TrendingHeroSlide({ item }: TrendingHeroSlideProps) {
  const { t } = useTranslation("discover");
  const [showModal, setShowModal] = useState(false);
  const track = item.track;
  const trackName = track.title ?? t("trendingHero.unknownTrack");
  const artistName = track.artists?.[0]?.name ?? track.artist ?? t("trendingHero.unknownArtist");
  const imageUrl = track.images?.[0]?.url ?? null;

  const handleRequest = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setShowModal(true);
  }, []);

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
            <motion.button
              type="button"
              className={primaryGradientButton({ size: "sm", glow: "primary", hover: "lighten" })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRequest}
              aria-label={t("trendingHero.requestAriaLabel", { title: trackName })}
            >
              <Download className="h-3.5 w-3.5" />
              {t("trendingHero.request")}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {showModal && (
        <ConfigRequestModal
          isOpen={showModal}
          item={track}
          itemType={ContentType.enum.track}
          onClose={() => setShowModal(false)}
          parentAlbum={null}
        />
      )}
    </>
  );
}
