"use client";

import { MicVocal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { SOURCE_NAMES } from "@components/SourceBadge";
import { WidgetFrame } from "@components/WidgetFrame";
import { artistRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useProviderTopArtists } from "@hooks/api/queries/analytics/useProviderTopArtists";

import { chartRank } from "../Charts/styles";
import { COMPACT_ROW_LIMIT, PROVIDER_SETTINGS_HREFS } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function TopArtists({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t, i18n } = useTranslation("discover");
  const { data, isLoading, isError } = useProviderTopArtists(provider);
  const { openForResult } = useContentRequestFlow();
  const name = SOURCE_NAMES[provider];
  const unlinked = data?.status === "unlinked";
  const inactive = data?.status === "inactive";
  const artists = data?.status === "ready" ? data.artists : [];
  const shown = size === "S" ? artists.slice(0, COMPACT_ROW_LIMIT) : artists;

  return (
    <WidgetFrame
      icon={MicVocal}
      title={t("topArtists.title")}
      subtitle={t("topArtists.subtitle", { provider: name })}
      info={info}
      titleId={`top-artists-heading-${provider}`}
      loading={isLoading}
      action={unlinked ? { label: t("topArtists.link"), href: PROVIDER_SETTINGS_HREFS[provider] } : undefined}
      note={
        isError
          ? t("board.loadError")
          : inactive
            ? t("board.providerInactive", { provider: name })
            : unlinked
              ? t("topArtists.unlinked", { provider: name })
              : artists.length === 0
                ? t("topArtists.empty")
                : null
      }
    >
      <FadeScroll>
        <ol className={widgetList({ columns: listColumns(size) })}>
          {shown.map((artist, index) => {
            const { catalogArtistId } = artist;
            return (
              <WidgetRow
                key={artist.name}
                cover={artist.image}
                seed={artist.name}
                title={artist.name}
                subtitle={t("topArtists.plays", {
                  count: artist.playcount,
                  formatted: artist.playcount.toLocaleString(i18n.language),
                })}
                lead={<span className={chartRank()}>{index + 1}</span>}
                onSelect={
                  catalogArtistId
                    ? () =>
                        openForResult(
                          artistRequestItem({ id: catalogArtistId, name: artist.name, cover: artist.image })
                        )
                    : undefined
                }
              />
            );
          })}
        </ol>
      </FadeScroll>
    </WidgetFrame>
  );
}
