"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import { useLastfmFeeds } from "@hooks/api/queries/discovery/useLastfmFeeds";
import { fadeIn } from "@utils/animations";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { LASTFM_USER_URL_BASE } from "./constants";
import { RecentScrobblesEmpty } from "./RecentScrobblesEmpty";
import { RecentScrobblesRail } from "./RecentScrobblesRail";
import { RecentScrobblesSkeleton } from "./RecentScrobblesSkeleton";

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
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby="recent-scrobbles-heading"
    >
      <WidgetHeader
        icon={Activity}
        title="Recent Scrobbles"
        subtitle="Last.fm"
        titleId="recent-scrobbles-heading"
        action={{ label: "See more", ariaLabel: "Open Last.fm profile", href: seeMoreHref, external: true }}
      />
      <RecentScrobblesRail scrobbles={scrobbles} />
    </motion.section>
  );
}
