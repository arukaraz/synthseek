"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { ConfigRequestModal } from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { ContentBrowserModal } from "@features/search/components/ContentBrowserModal/ContentBrowserModal";
import type { RequestContext } from "@features/search/components/ContentBrowserModal/types";
import type { MusicItem } from "@api/__generated__/types";
import { useArtistSpotlight } from "@hooks/api/queries/useArtistSpotlight";
import { useCountry } from "@modules/providers/CountryProvider";
import { ContentType } from "@api/__generated__/types";
import { gradientOverlay } from "@theme/utilities/styles";
import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { fadeIn } from "@utils/animations";
import { DEFAULT_COUNTRY, getCountryByCode } from "@utils/countries";
import { motion } from "framer-motion";
import { AlertCircle, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArtistSpotlightCard } from "./ArtistSpotlightCard";
import { ArtistSpotlightSkeleton } from "./ArtistSpotlightSkeleton";
import { ARTIST_SPOTLIGHT_COUNT } from "./constants";

export function ArtistSpotlight() {
  const { t } = useTranslation("discover");
  const { country } = useCountry();
  const countryData = getCountryByCode(country) ?? getCountryByCode(DEFAULT_COUNTRY);
  const countryName = countryData?.name ?? "";

  const { data, isLoading, isError } = useArtistSpotlight(countryName, ARTIST_SPOTLIGHT_COUNT);
  const artists = data?.data?.artists ?? [];

  const [selectedArtist, setSelectedArtist] = useState<MusicItem | null>(null);
  const [showContentBrowserModal, setShowContentBrowserModal] = useState(false);
  const [showConfigRequestModal, setShowConfigRequestModal] = useState(false);
  const [selectedContentToRequest, setSelectedContentToRequest] = useState<MusicItem | null>(null);
  const [parentAlbumFromContext, setParentAlbumFromContext] = useState<MusicItem | null>(null);

  const handleArtistClick = (artist: MusicItem) => {
    setSelectedArtist(artist);
    setShowContentBrowserModal(true);
  };

  const handleCloseContentBrowserModal = () => {
    setSelectedArtist(null);
    setShowContentBrowserModal(false);
  };

  const handleRequestContentClick = (requestedItem: MusicItem, context?: RequestContext) => {
    if (requestedItem.type === ContentType.enum.track || requestedItem.type === ContentType.enum.album) {
      setSelectedContentToRequest(requestedItem);
      setParentAlbumFromContext(context?.parentAlbum ?? null);
      setShowConfigRequestModal(true);
      setShowContentBrowserModal(false);
    }
  };

  const handleConfigModalClose = () => {
    setShowConfigRequestModal(false);
    setSelectedContentToRequest(null);
    setParentAlbumFromContext(null);
  };

  return (
    <>
      <motion.section
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={glassPanelCard({ height: "auto" })}
        aria-labelledby="artist-spotlight-heading"
      >
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

        <div className="relative flex flex-1 flex-col">
          <WidgetHeader
            icon={Users}
            title={t("artistSpotlight.title")}
            subtitle={t("artistSpotlight.subtitle")}
            titleId="artist-spotlight-heading"
          />

          {isLoading && <ArtistSpotlightSkeleton />}

          {isError && (
            <EmptyState
              icon={AlertCircle}
              title={t("artistSpotlight.errorTitle")}
              description={t("artistSpotlight.errorDescription")}
            />
          )}

          {!isLoading && !isError && artists.length === 0 && (
            <EmptyState
              icon={Users}
              title={t("artistSpotlight.emptyTitle")}
              description={t("artistSpotlight.emptyDescription")}
            />
          )}

          {!isLoading && !isError && artists.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {artists.map((item) => (
                <ArtistSpotlightCard
                  key={item.artist.id}
                  artist={item.artist}
                  latestAlbum={item.latestAlbum}
                  onClick={() => handleArtistClick(item.artist)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.section>

      {selectedArtist && (
        <ContentBrowserModal
          type={ContentType.enum.artist}
          data={selectedArtist}
          onClose={handleCloseContentBrowserModal}
          open={showContentBrowserModal}
          onRequestClick={handleRequestContentClick}
        />
      )}

      {selectedContentToRequest && (
        <ConfigRequestModal
          isOpen={showConfigRequestModal}
          item={selectedContentToRequest}
          itemType={selectedContentToRequest.type}
          onClose={handleConfigModalClose}
          parentAlbum={parentAlbumFromContext}
        />
      )}
    </>
  );
}
