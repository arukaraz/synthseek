"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useLastfmFeeds } from "@hooks/api/queries/discovery/useLastfmFeeds";
import { fadeIn } from "@utils/animations";

import { LASTFM_USER_URL_BASE } from "./constants";
import { scrobbleLayoutFor } from "./helpers";
import { RecentScrobblesEmpty } from "./RecentScrobblesEmpty";
import { RecentScrobblesRail } from "./RecentScrobblesRail";
import { RecentScrobblesSkeleton } from "./RecentScrobblesSkeleton";
import { RecentScrobblesTimeline } from "./RecentScrobblesTimeline";
import type { RecentScrobblesProps } from "./types";

export function RecentScrobbles({ size, info }: RecentScrobblesProps) {
  const { t } = useTranslation("discover");
  const { lfmConfig, recentScrobbles, isLoading, isError } = useLastfmFeeds();
  const layout = scrobbleLayoutFor(size);

  if (isLoading) return <RecentScrobblesSkeleton layout={layout} />;
  if (isError) return <RecentScrobblesEmpty reason="error" info={info} />;
  if (!lfmConfig || !lfmConfig.enabled) return <RecentScrobblesEmpty reason="disabled" info={info} />;
  if (!lfmConfig.username) return <RecentScrobblesEmpty reason="no-username" info={info} />;
  if (!recentScrobbles || recentScrobbles.status !== "ready") {
    return <RecentScrobblesEmpty reason="no-data" info={info} />;
  }

  const scrobbles = recentScrobbles.scrobbles.filter((s) => s.playedAt != null);
  if (scrobbles.length === 0) {
    return <RecentScrobblesEmpty reason="no-data" info={info} />;
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
        title={t("recentScrobbles.title")}
        subtitle={t("recentScrobbles.subtitle")}
        titleId="recent-scrobbles-heading"
        info={info}
        action={{
          label: t("recentScrobbles.seeMore"),
          ariaLabel: t("recentScrobbles.seeMoreAriaLabel"),
          href: seeMoreHref,
          external: true,
        }}
      />
      {layout === "timeline" ? (
        <RecentScrobblesTimeline scrobbles={scrobbles} />
      ) : (
        <RecentScrobblesRail scrobbles={scrobbles} />
      )}
    </motion.section>
  );
}
