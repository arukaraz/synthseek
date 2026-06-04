"use client";

import { motion } from "framer-motion";
import { Library } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ContentType } from "@api/__generated__/types";
import { ConfigRequestModal } from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { ContentBrowserModal } from "@features/search/components/ContentBrowserModal/ContentBrowserModal";
import { useDiscoveryMixes } from "@hooks/api/queries/discovery/useDiscoveryMixes";
import { useContentRequestModals } from "@hooks/ui/useContentRequestModals";
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

  const flow = useContentRequestModals();
  const [selectedMix, setSelectedMix] = useState<ReadyMix | null>(null);

  const syntheticTracks = useMemo(
    () => (selectedMix ? selectedMix.candidates.map(synthesizeTrack) : []),
    [selectedMix]
  );
  const syntheticPlaylist = useMemo(
    () => (selectedMix ? synthesizePlaylist(selectedMix, LB_KIND_METADATA[selectedMix.kind], syntheticTracks) : null),
    [selectedMix, syntheticTracks]
  );

  const handleCardClick = (mix: ReadyMix) => {
    const tracks = mix.candidates.map(synthesizeTrack);
    const playlist = synthesizePlaylist(mix, LB_KIND_METADATA[mix.kind], tracks);
    setSelectedMix(mix);
    flow.openForResult(playlist);
  };

  const handleCloseBrowser = () => {
    flow.browserModalProps.onClose();
    setSelectedMix(null);
  };

  const handleCloseConfig = () => {
    flow.configModalProps.onClose();
    setSelectedMix(null);
  };

  if (isLoading) return <DiscoveryMixesSkeleton />;
  if (isError) return <DiscoveryMixesEmpty reason="error" />;
  if (!lbConfig || !lbConfig.enabled) return <DiscoveryMixesEmpty reason="disabled" />;
  if (!lbConfig.username) return <DiscoveryMixesEmpty reason="no-username" />;
  if (mixes.length === 0) return <DiscoveryMixesEmpty reason="no-kinds" />;

  return (
    <>
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

      {selectedMix && syntheticPlaylist && flow.selectedResult ? (
        <ContentBrowserModal
          {...flow.browserModalProps}
          type={ContentType.enum.playlist}
          data={syntheticPlaylist}
          preloadedItems={syntheticTracks}
          requestButtonDisabled={lbConfig.autoRequest}
          requestButtonTooltip={lbConfig.autoRequest ? t("mixes.autoRequestTooltip") : undefined}
          onClose={handleCloseBrowser}
        />
      ) : null}

      {flow.selectedContentToRequest ? (
        <ConfigRequestModal
          {...flow.configModalProps}
          preloadedTracks={
            flow.selectedContentToRequest.type === ContentType.enum.playlist ? syntheticTracks : undefined
          }
          onClose={handleCloseConfig}
        />
      ) : null}
    </>
  );
}
