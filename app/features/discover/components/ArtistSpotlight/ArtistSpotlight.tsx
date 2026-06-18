"use client";

import { EmptyState } from "@components/ui/EmptyState";
import type { MusicItem } from "@api/__generated__/types";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useArtistSpotlight } from "@hooks/api/queries/useArtistSpotlight";
import { useCountry } from "@modules/providers/CountryProvider";
import { gradientOverlay } from "@theme/utilities/styles";
import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { fadeIn } from "@utils/animations";
import { DEFAULT_COUNTRY, getCountryByCode } from "@utils/countries";
import { motion } from "framer-motion";
import { AlertCircle, Users } from "lucide-react";
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

  const { openForResult } = useContentRequestFlow();

  const handleArtistClick = (artist: MusicItem) => {
    openForResult(artist);
  };

  return (
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
  );
}
