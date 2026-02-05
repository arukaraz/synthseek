"use client";

import { EmptyState } from "@components/ui/EmptyState";
import ConfigRequestModal from "@features/search/components/ConfigRequestModal/ConfigRequestModal";
import { ContentBrowserModal } from "@features/search/components/ContentBrowserModal/ContentBrowserModal";
import type { RequestContext } from "@features/search/components/ContentBrowserModal/types";
import { useArtistSpotlight } from "@hooks/api/queries/useArtistSpotlight";
import { useCountry } from "@modules/providers/CountryProvider";
import { ContentType } from "@api/__generated__/types";
import type { SpotifyItem } from "@api/__generated__/types";
import { gradientOverlay } from "@theme/utilities/styles";
import { glassPanelCard } from "../styles";
import { fadeIn } from "@utils/animations";
import { getCountryByCode } from "@utils/countries";
import { motion } from "framer-motion";
import { AlertCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArtistSpotlightCard } from "./ArtistSpotlightCard";

const ARTIST_SPOTLIGHT_COUNT = 4;

function ArtistSpotlightSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: ARTIST_SPOTLIGHT_COUNT }).map((_, i) => (
        <div key={i} className="bg-fg/5 aspect-3/4 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

export function ArtistSpotlight() {
  const router = useRouter();
  const { country } = useCountry();
  const countryData = getCountryByCode(country);
  const countryName = countryData?.name || "United States";

  const { data, isLoading, isError } = useArtistSpotlight(countryName, ARTIST_SPOTLIGHT_COUNT);
  const artists = data?.data?.artists ?? [];

  const [selectedArtist, setSelectedArtist] = useState<SpotifyApi.ArtistObjectFull | null>(null);
  const [showContentBrowserModal, setShowContentBrowserModal] = useState(false);
  const [showConfigRequestModal, setShowConfigRequestModal] = useState(false);
  const [selectedContentToRequest, setSelectedContentToRequest] = useState<SpotifyItem | null>(null);
  const [parentAlbumFromContext, setParentAlbumFromContext] = useState<SpotifyItem | null>(null);

  const handleSeeMore = () => {
    const query = `top artists in ${countryName}`;
    router.push(`/search?q=${encodeURIComponent(query)}&filter=artist`);
  };

  const handleArtistClick = (artist: {
    id: string;
    name: string;
    images: SpotifyApi.ImageObject[];
    followers: { total: number };
    genres: string[];
  }) => {
    setSelectedArtist(artist as SpotifyApi.ArtistObjectFull);
    setShowContentBrowserModal(true);
  };

  const handleCloseContentBrowserModal = () => {
    setSelectedArtist(null);
    setShowContentBrowserModal(false);
  };

  const handleRequestContentClick = (requestedItem: SpotifyItem, context?: RequestContext) => {
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
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className={glassPanelCard({ height: "auto" })}>
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

        <div className="relative flex flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-fg text-lg font-semibold">Artist Spotlight</h3>
              <p className="text-fg/60 text-xs">Top artists in your region</p>
            </div>
            <button
              onClick={handleSeeMore}
              aria-label="View all artists"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
            >
              See more →
            </button>
          </div>

          {isLoading && <ArtistSpotlightSkeleton />}

          {isError && (
            <EmptyState
              icon={AlertCircle}
              title="Failed to load artists"
              description="Unable to fetch top artists. Please try again later."
            />
          )}

          {!isLoading && !isError && artists.length === 0 && (
            <EmptyState icon={Users} title="No Artists Found" description="No top artists found for this region." />
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
      </motion.div>

      {selectedArtist && (
        <ContentBrowserModal
          type={ContentType.enum.artist}
          data={selectedArtist as unknown as SpotifyItem}
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
