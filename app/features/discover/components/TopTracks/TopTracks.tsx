"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useLastfmFeeds } from "@hooks/api/queries/discovery/useLastfmFeeds";
import { fadeIn } from "@utils/animations";

import { HERO_LIMIT, LIST_LIMIT } from "./constants";
import { TopTrackHero } from "./TopTrackHero";
import { TopTracksEmpty } from "./TopTracksEmpty";
import { TopTracksList } from "./TopTracksList";
import { TopTracksSkeleton } from "./TopTracksSkeleton";
import { body, bodyFrame } from "./styles";
import type { TopTracksProps } from "./types";

export function TopTracks({ info }: TopTracksProps) {
  const { t } = useTranslation("discover");
  const { lfmConfig, topTracks, isLoading, isError } = useLastfmFeeds();

  if (isLoading) return <TopTracksSkeleton />;
  if (isError) return <TopTracksEmpty reason="error" info={info} />;
  if (!lfmConfig || !lfmConfig.enabled) return <TopTracksEmpty reason="disabled" info={info} />;
  if (!lfmConfig.username) return <TopTracksEmpty reason="no-username" info={info} />;
  if (!topTracks || topTracks.status !== "ready" || topTracks.tracks.length === 0) {
    return <TopTracksEmpty reason="no-data" info={info} />;
  }

  const hero = topTracks.tracks[0];
  const rest = topTracks.tracks.slice(HERO_LIMIT, HERO_LIMIT + LIST_LIMIT);

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby="top-tracks-heading"
    >
      <WidgetHeader
        icon={Trophy}
        title={t("topTracks.title")}
        subtitle={t("topTracks.subtitle")}
        titleId="top-tracks-heading"
        info={info}
      />
      <div className={bodyFrame()}>
        <div className={body()}>
          <TopTrackHero track={hero} />
          <TopTracksList tracks={rest} startRank={HERO_LIMIT + 1} />
        </div>
      </div>
    </motion.section>
  );
}
