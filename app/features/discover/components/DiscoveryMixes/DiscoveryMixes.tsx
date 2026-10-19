"use client";

import { motion } from "framer-motion";
import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { playlistPreloadedTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useDiscoveryMixes } from "@hooks/api/queries/discovery/useDiscoveryMixes";
import { fadeIn } from "@utils/animations";

import { DiscoveryMixCard } from "./DiscoveryMixCard";
import { DiscoveryMixCardEmpty } from "./DiscoveryMixCardEmpty";
import { DiscoveryMixesEmpty } from "./DiscoveryMixesEmpty";
import { DiscoveryMixesSkeleton } from "./DiscoveryMixesSkeleton";
import { LB_KIND_METADATA } from "./constants";
import { synthesizePlaylist, synthesizeTrack } from "./helpers";
import { mixBody, mixGrid } from "./styles";
import type { DiscoveryMixesProps, ReadyMix } from "./types";

export function DiscoveryMixes({ size, info }: DiscoveryMixesProps) {
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
  if (isError) return <DiscoveryMixesEmpty reason="error" info={info} />;
  if (!lbConfig || !lbConfig.enabled) return <DiscoveryMixesEmpty reason="disabled" info={info} />;
  if (!lbConfig.username) return <DiscoveryMixesEmpty reason="no-username" info={info} />;
  if (mixes.length === 0) return <DiscoveryMixesEmpty reason="no-kinds" info={info} />;

  const compact = size === "L";

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
        info={info}
      />
      <div className={mixBody()}>
        <div className={mixGrid()}>
          {mixes.map((mix) =>
            mix.status === "ready" ? (
              <DiscoveryMixCard key={mix.kind} mix={mix} compact={compact} onClick={() => handleCardClick(mix)} />
            ) : (
              <DiscoveryMixCardEmpty key={mix.kind} mix={mix} compact={compact} />
            )
          )}
        </div>
      </div>
    </motion.section>
  );
}
