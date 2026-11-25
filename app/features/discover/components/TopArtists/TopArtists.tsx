"use client";

import { MicVocal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { WidgetFrame } from "@components/WidgetFrame";
import { useProviderTopArtists } from "@hooks/api/queries/analytics/useProviderTopArtists";

import { useWidgetControls } from "../../hooks/useWidgetControls";
import { BUILTIN_LEADER_ACCENT, PROVIDER_SETTINGS_HREFS } from "../constants";
import { LeaderBlock } from "../CustomWidget/LeaderBlock";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { topArtistItem } from "./helpers";

export function TopArtists({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t, i18n } = useTranslation("discover");
  const { data, isLoading, isError } = useProviderTopArtists(provider);
  const controls = useWidgetControls("open");
  const name = SOURCE_NAMES[provider];
  const unlinked = data?.status === "unlinked";
  const inactive = data?.status === "inactive";
  const artists = data?.status === "ready" ? data.artists : [];
  const items = artists.map((artist) =>
    topArtistItem(
      artist,
      t("topArtists.plays", { count: artist.playcount, formatted: artist.playcount.toLocaleString(i18n.language) })
    )
  );

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
              : items.length === 0
                ? t("topArtists.empty")
                : null
      }
    >
      <LeaderBlock
        items={items}
        size={size}
        accent={BUILTIN_LEADER_ACCENT}
        controls={controls}
        badge={t("topArtists.leaderBadge")}
      />
    </WidgetFrame>
  );
}
