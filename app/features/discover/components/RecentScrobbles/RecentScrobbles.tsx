"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";

import { useLastfmFeeds } from "@hooks/api/queries/discovery/useLastfmFeeds";
import { fadeIn } from "@utils/animations";

import { glassPanelCard } from "../styles";
import { LASTFM_USER_URL_BASE } from "./constants";
import { RecentScrobblesEmpty } from "./RecentScrobblesEmpty";
import { RecentScrobblesRail } from "./RecentScrobblesRail";
import { RecentScrobblesSkeleton } from "./RecentScrobblesSkeleton";
import {
  headerTitleRow,
  headerTitleStack,
  sectionIcon,
  seeMoreLink,
  widgetHeader,
  widgetSub,
  widgetTitle,
} from "./styles";

export function RecentScrobbles() {
  const { lfmConfig, recentScrobbles, isLoading, isError } = useLastfmFeeds();

  if (isLoading) return <RecentScrobblesSkeleton />;
  if (isError) return <RecentScrobblesEmpty reason="error" />;
  if (!lfmConfig || !lfmConfig.enabled) return <RecentScrobblesEmpty reason="disabled" />;
  if (!lfmConfig.username) return <RecentScrobblesEmpty reason="no-username" />;
  if (!recentScrobbles || recentScrobbles.status !== "ready") {
    return <RecentScrobblesEmpty reason="no-data" />;
  }

  const scrobbles = recentScrobbles.scrobbles.filter((s) => s.playedAt != null);
  if (scrobbles.length === 0) {
    return <RecentScrobblesEmpty reason="no-data" />;
  }

  const seeMoreHref = `${LASTFM_USER_URL_BASE}/${encodeURIComponent(lfmConfig.username)}`;

  return (
    <motion.section variants={fadeIn} initial="hidden" animate="visible" className={glassPanelCard({ height: "auto" })}>
      <header className={widgetHeader()}>
        <div className={headerTitleStack()}>
          <div className={headerTitleRow()}>
            <span className={sectionIcon()}>
              <Activity className="size-4" />
            </span>
            <h2 className={widgetTitle()}>Recent Scrobbles</h2>
          </div>
          <p className={widgetSub()}>Last.FM</p>
        </div>
        <a href={seeMoreHref} target="_blank" rel="noopener noreferrer" className={seeMoreLink()}>
          See more <ArrowRight className="size-3" />
        </a>
      </header>
      <RecentScrobblesRail scrobbles={scrobbles} />
    </motion.section>
  );
}
