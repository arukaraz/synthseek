"use client";

import { FadeScroll } from "@components/FadeScroll";
import { EmptyState } from "@components/ui/EmptyState";
import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import type { MusicItem } from "@api/__generated__/types";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useArtistsForYou } from "@hooks/api/queries/analytics/useArtistsForYou";
import { useCountry } from "@modules/providers/CountryProvider";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { DEFAULT_COUNTRY, getCountryByCode } from "@utils/countries";
import { motion } from "framer-motion";
import { AlertCircle, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { ArtistSpotlightCard } from "./ArtistSpotlightCard";
import { ArtistSpotlightSkeleton } from "./ArtistSpotlightSkeleton";
import { spotlightBody, spotlightGrid } from "./styles";
import type { ArtistSpotlightProps } from "./types";

export function ArtistSpotlight({ size, info }: ArtistSpotlightProps) {
  const { t } = useTranslation("discover");
  const { country } = useCountry();
  const countryData = getCountryByCode(country) ?? getCountryByCode(DEFAULT_COUNTRY);
  const countryName = countryData?.name ?? "";

  const { data, isLoading, isError } = useArtistsForYou(countryName);
  const artists = data ?? [];

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
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className={spotlightBody()}>
        <WidgetHeader
          icon={Users}
          title={t("artistSpotlight.title")}
          subtitle={t("artistSpotlight.subtitle")}
          titleId="artist-spotlight-heading"
          info={info}
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

        {!isLoading && !isError && artists.length > 0 && size === "S" && (
          <FadeScroll>
            <ul className={widgetList()}>
              {artists.map((item) => (
                <WidgetRow
                  key={item.artist.id}
                  cover={item.artist.images[0]?.url ?? null}
                  seed={item.artist.id}
                  title={item.artist.name}
                  subtitle={item.latestAlbum?.name ?? t("artistSpotlight.noAlbums")}
                  onSelect={() => handleArtistClick(item.artist)}
                />
              ))}
            </ul>
          </FadeScroll>
        )}

        {!isLoading && !isError && artists.length > 0 && size !== "S" && (
          <div className={spotlightGrid()}>
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
