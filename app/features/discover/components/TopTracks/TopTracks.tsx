"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

import { useLastfmFeeds } from "@hooks/api/queries/discovery/useLastfmFeeds";
import { fadeIn } from "@utils/animations";

import { glassPanelCard } from "../styles";
import { HERO_LIMIT, LIST_LIMIT } from "./constants";
import { TopTrackHero } from "./TopTrackHero";
import { TopTracksEmpty } from "./TopTracksEmpty";
import { TopTracksList } from "./TopTracksList";
import { TopTracksSkeleton } from "./TopTracksSkeleton";
import { body, headerTitleRow, headerTitleStack, sectionIcon, widgetHeader, widgetSub, widgetTitle } from "./styles";

export function TopTracks() {
  const { lfmConfig, topTracks, isLoading, isError } = useLastfmFeeds();

  if (isLoading) return <TopTracksSkeleton />;
  if (isError) return <TopTracksEmpty reason="error" />;
  if (!lfmConfig || !lfmConfig.enabled) return <TopTracksEmpty reason="disabled" />;
  if (!lfmConfig.username) return <TopTracksEmpty reason="no-username" />;
  if (!topTracks || topTracks.status !== "ready" || topTracks.candidates.length === 0) {
    return <TopTracksEmpty reason="no-data" />;
  }

  const hero = topTracks.candidates[0];
  const rest = topTracks.candidates.slice(HERO_LIMIT, HERO_LIMIT + LIST_LIMIT);

  return (
    <motion.section variants={fadeIn} initial="hidden" animate="visible" className={glassPanelCard({ height: "auto" })}>
      <header className={widgetHeader()}>
        <div className={headerTitleStack()}>
          <div className={headerTitleRow()}>
            <span className={sectionIcon()}>
              <Trophy className="size-4" />
            </span>
            <h2 className={widgetTitle()}>Top Tracks</h2>
          </div>
          <p className={widgetSub()}>Most played · all time · Last.fm</p>
        </div>
      </header>
      <div className={body()}>
        <TopTrackHero candidate={hero} />
        <TopTracksList candidates={rest} startRank={HERO_LIMIT + 1} />
      </div>
    </motion.section>
  );
}
