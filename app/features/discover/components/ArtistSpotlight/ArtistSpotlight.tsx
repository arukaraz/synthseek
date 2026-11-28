"use client";

import { FadeScroll } from "@components/FadeScroll";
import { EmptyState } from "@components/ui/EmptyState";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import type { MusicItem } from "@api/__generated__/types";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useArtistsForYou } from "@hooks/api/queries/analytics/useArtistsForYou";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useMotionReduced } from "@hooks/ui/useMotionReduced";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Dices, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@components/ui/IconButton";
import { isWideSize } from "../helpers";
import { railScroller, snapRail } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { ArtistSpotlightCard } from "./ArtistSpotlightCard";
import { ArtistSpotlightSkeleton } from "./ArtistSpotlightSkeleton";
import { SWAP_VARIANTS, SWAP_VARIANTS_REDUCED } from "./constants";
import { spotlightBody, spotlightGrid, spotlightListBusy, spotlightReroll, spotlightSlot } from "./styles";
import type { ArtistSpotlightProps } from "./types";

export function ArtistSpotlight({ size, info }: ArtistSpotlightProps) {
  const { t } = useTranslation("discover");

  const { data, isLoading, isError, pending, replace, reroll } = useArtistsForYou();
  const artists = data ?? [];
  const swapping = pending.length > 0;
  const rolling = swapping && artists.every((item) => pending.includes(item.artist.id));
  const [staggered, setStaggered] = useState(false);
  const variants = useMotionReduced() ? SWAP_VARIANTS_REDUCED : SWAP_VARIANTS;

  const { openForResult } = useContentRequestFlow();
  const { shuffleEntity } = useEntityPlayback();

  const handleArtistClick = (artist: MusicItem) => {
    openForResult(artist);
  };

  const shuffleOf = (name: string, inLibrary: boolean) =>
    inLibrary ? () => void shuffleEntity({ kind: "artist", artist: name }) : undefined;

  const cards = artists.map((item, index) => (
    <div key={index} className={spotlightSlot()}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={item.artist.id}
          className={spotlightSlot()}
          variants={variants}
          custom={staggered ? index : 0}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <ArtistSpotlightCard
            artist={item.artist}
            latestAlbum={item.latestAlbum}
            onClick={() => handleArtistClick(item.artist)}
            onPlay={shuffleOf(item.artist.name, item.inLibrary)}
            onDismiss={() => {
              setStaggered(false);
              void replace(item.artist.id);
            }}
            dismissDisabled={swapping}
            loading={pending.includes(item.artist.id)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  ));

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby="artist-spotlight-heading"
    >
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className={spotlightBody()}>
        <WidgetHeader
          icon={Users}
          title={t("artistSpotlight.title")}
          subtitle={t("artistSpotlight.subtitle")}
          titleId="artist-spotlight-heading"
          info={info}
          aside={
            artists.length > 0 ? (
              <IconButton
                icon={Dices}
                variant="ghost"
                size="lg"
                aria-label={t("artistSpotlight.reroll")}
                title={t("artistSpotlight.reroll")}
                className={spotlightReroll({ rolling })}
                aria-busy={rolling}
                disabled={swapping}
                onClick={() => {
                  setStaggered(true);
                  void reroll();
                }}
              />
            ) : undefined
          }
        />

        {isLoading && <ArtistSpotlightSkeleton />}

        {isError && (
          <EmptyState
            icon={AlertCircle}
            title={t("artistSpotlight.errorTitle")}
            description={t("artistSpotlight.errorDescription")}
          />
        )}

        {!isLoading && !isError && artists.length === 0 && (
          <EmptyState
            icon={Users}
            title={t("artistSpotlight.emptyTitle")}
            description={t("artistSpotlight.emptyDescription")}
          />
        )}

        {!isLoading && !isError && artists.length > 0 && size === "S" && (
          <FadeScroll>
            <ul className={cn(widgetList(), spotlightListBusy({ busy: swapping }))} aria-busy={swapping}>
              {artists.map((item) => (
                <WidgetRow
                  key={item.artist.id}
                  cover={item.artist.images[0]?.url ?? null}
                  seed={item.artist.id}
                  title={item.artist.name}
                  subtitle={item.latestAlbum?.name ?? t("artistSpotlight.noAlbums")}
                  onSelect={() => handleArtistClick(item.artist)}
                  coverAction={
                    item.inLibrary
                      ? {
                          kind: "play",
                          label: t("history.play", { name: item.artist.name }),
                          onClick: () => void shuffleEntity({ kind: "artist", artist: item.artist.name }),
                        }
                      : undefined
                  }
                />
              ))}
            </ul>
          </FadeScroll>
        )}

        {!isLoading && !isError && artists.length > 0 && size === "M" && (
          <FadeScroll axis="x" arrows className={railScroller()} label={t("artistSpotlight.rail")}>
            <div className={snapRail()}>{cards}</div>
          </FadeScroll>
        )}

        {!isLoading && !isError && artists.length > 0 && isWideSize(size) && (
          <div className={spotlightGrid()}>{cards}</div>
        )}
      </div>
    </motion.section>
  );
}
