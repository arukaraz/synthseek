"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useListenedTracks } from "@hooks/api/queries/analytics/useListenedTracks";
import { fadeIn } from "@utils/animations";

import { PROVIDER_PROFILE_URLS } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { scrobbleLayoutFor, scrobblesTitleKey } from "./helpers";
import { RecentScrobblesEmpty } from "./RecentScrobblesEmpty";
import { RecentScrobblesRail } from "./RecentScrobblesRail";
import { RecentScrobblesSkeleton } from "./RecentScrobblesSkeleton";
import { RecentScrobblesTimeline } from "./RecentScrobblesTimeline";

export function RecentScrobbles({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useListenedTracks(provider);
  const layout = scrobbleLayoutFor(size);

  if (isLoading) return <RecentScrobblesSkeleton layout={layout} />;
  if (isError || !data) return <RecentScrobblesEmpty reason="error" info={info} provider={provider} />;
  if (data.status !== "ready") return <RecentScrobblesEmpty reason={data.status} info={info} provider={provider} />;

  const scrobbles = data.recentTracks.filter((s) => s.playedAt != null);
  if (scrobbles.length === 0) {
    return <RecentScrobblesEmpty reason="no-data" info={info} provider={provider} />;
  }

  const name = SOURCE_NAMES[provider];
  const seeMoreHref = `${PROVIDER_PROFILE_URLS[provider]}/${encodeURIComponent(data.username)}`;
  const headingId = `recent-scrobbles-heading-${provider}`;

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby={headingId}
    >
      <WidgetHeader
        icon={Activity}
        title={t(scrobblesTitleKey(provider))}
        subtitle={name}
        titleId={headingId}
        info={info}
        action={{
          label: t("recentScrobbles.seeMore"),
          ariaLabel: t("recentScrobbles.seeMoreAriaLabel", { provider: name }),
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
