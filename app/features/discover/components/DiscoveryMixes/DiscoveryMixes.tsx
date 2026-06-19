"use client";

import { motion } from "framer-motion";
import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";

import { playlistPreloadedTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useDiscoveryMixes } from "@hooks/api/queries/discovery/useDiscoveryMixes";
import { fadeIn } from "@utils/animations";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { DiscoveryMixCard } from "./DiscoveryMixCard";
import { DiscoveryMixCardEmpty } from "./DiscoveryMixCardEmpty";
import { DiscoveryMixesEmpty } from "./DiscoveryMixesEmpty";
import { DiscoveryMixesSkeleton } from "./DiscoveryMixesSkeleton";
import { LB_KIND_METADATA } from "./constants";
import { synthesizePlaylist, synthesizeTrack } from "./helpers";
import { mixGrid } from "./styles";
import type { ReadyMix } from "./types";

export function DiscoveryMixes() {
  const { t } = useTranslation("discover");
  const { mixes, lbConfig, isLoading, isError } = useDiscoveryMixes();
  const { openForTarget } = useContentRequestFlow();

  const handleCardClick = (mix: ReadyMix) => {
    const tracks = mix.candidates.map(synthesizeTrack);
    const customName = lbConfig?.playlistNames?.[mix.kind];
    const playlist = synthesizePlaylist(mix, LB_KIND_METADATA[mix.kind], tracks, customName);
    const autoRequest = lbConfig?.autoRequest ?? false;
    openForTarget(
      playlistPreloadedTarget({
        id: playlist.id,
        name: playlist.name,
        cover: playlist.images[0]?.url ?? null,
        tracks,
        requestDisabled: autoRequest,
        requestDisabledTooltip: autoRequest ? t("mixes.autoRequestTooltip") : null,
      })
    );
  };

  if (isLoading) return <DiscoveryMixesSkeleton />;
  if (isError) return <DiscoveryMixesEmpty reason="error" />;
  if (!lbConfig || !lbConfig.enabled) return <DiscoveryMixesEmpty reason="disabled" />;
  if (!lbConfig.username) return <DiscoveryMixesEmpty reason="no-username" />;
  if (mixes.length === 0) return <DiscoveryMixesEmpty reason="no-kinds" />;

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ height: "auto" })}
      aria-labelledby="discover-mixes-heading"
    >
      <WidgetHeader
        icon={Library}
        title={t("mixes.title")}
        subtitle={t("mixes.subtitle")}
        titleId="discover-mixes-heading"
      />
      <div className={mixGrid()}>
        {mixes.map((mix) =>
          mix.status === "ready" ? (
            <DiscoveryMixCard key={mix.kind} mix={mix} onClick={() => handleCardClick(mix)} />
          ) : (
            <DiscoveryMixCardEmpty key={mix.kind} mix={mix} />
          )
        )}
      </div>
    </motion.section>
  );
}
