"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLastfmFeeds } from "@hooks/api/queries/discovery/useLastfmFeeds";
import { fadeIn } from "@utils/animations";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { HERO_LIMIT, LIST_LIMIT } from "./constants";
import { heroShapeFor } from "./helpers";
import { TopTrackHero } from "./TopTrackHero";
import { TopTracksEmpty } from "./TopTracksEmpty";
import { TopTracksList } from "./TopTracksList";
import { TopTracksSkeleton } from "./TopTracksSkeleton";
import { body, bodyFrame } from "./styles";
import type { TopTracksProps } from "./types";

export function TopTracks({ size, info }: TopTracksProps) {
  const { t } = useTranslation("discover");
  const { lfmConfig, topTracks, isLoading, isError } = useLastfmFeeds();

  const shape = heroShapeFor(size);

  if (isLoading) return <TopTracksSkeleton shape={shape} />;
  if (isError) return <TopTracksEmpty reason="error" info={info} />;
  if (!lfmConfig || !lfmConfig.enabled) return <TopTracksEmpty reason="disabled" info={info} />;
  if (!lfmConfig.username) return <TopTracksEmpty reason="no-username" info={info} />;
  if (!topTracks || topTracks.status !== "ready" || topTracks.tracks.length === 0) {
    return <TopTracksEmpty reason="no-data" info={info} />;
  }

  const hero = topTracks.tracks[0];
  const listLimit = LIST_LIMIT[shape];
  const rest = topTracks.tracks.slice(HERO_LIMIT, HERO_LIMIT + listLimit);

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
        <div className={body({ shape })}>
          <TopTrackHero track={hero} shape={shape} />
          <TopTracksList tracks={rest} startRank={HERO_LIMIT + 1} />
        </div>
      </div>
    </motion.section>
  );
}
