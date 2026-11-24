"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useListenedTracks } from "@hooks/api/queries/analytics/useListenedTracks";
import { fadeIn } from "@utils/animations";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { leaderFrame, leaderLayout } from "../WidgetLeader/styles";
import { topTrackLookOf, topTracksSplit } from "./helpers";
import { TopTrackHero } from "./TopTrackHero";
import { TopTrackLeader } from "./TopTrackLeader";
import { TopTracksEmpty } from "./TopTracksEmpty";
import { TopTracksList } from "./TopTracksList";
import { TopTracksSkeleton } from "./TopTracksSkeleton";
import { body, bodyFrame } from "./styles";

export function TopTracks({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useListenedTracks(provider);

  if (isLoading) return <TopTracksSkeleton />;
  if (isError || !data) return <TopTracksEmpty reason="error" info={info} provider={provider} />;
  if (data.status !== "ready") return <TopTracksEmpty reason={data.status} info={info} provider={provider} />;
  if (data.topTracks.length === 0) return <TopTracksEmpty reason="no-data" info={info} provider={provider} />;

  const { hero, rest, startRank } = topTracksSplit(data.topTracks, size);
  const look = topTrackLookOf(size);
  const headingId = `top-tracks-heading-${provider}`;

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby={headingId}
    >
      <WidgetHeader
        icon={Trophy}
        title={t("topTracks.title")}
        subtitle={t("topTracks.subtitle", { provider: SOURCE_NAMES[provider] })}
        titleId={headingId}
        info={info}
      />
      <div className={look === "leader" ? leaderFrame() : bodyFrame()}>
        <div className={look === "leader" ? leaderLayout() : body()}>
          {hero ? look === "leader" ? <TopTrackLeader track={hero} /> : <TopTrackHero track={hero} /> : null}
          <TopTracksList tracks={rest} startRank={startRank} columns={listColumns(size)} />
        </div>
      </div>
    </motion.section>
  );
}
