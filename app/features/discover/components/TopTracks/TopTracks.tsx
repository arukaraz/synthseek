"use client";

import { Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";
import { WidgetFrame } from "@components/WidgetFrame";
import { useListenedTracks } from "@hooks/api/queries/analytics/useListenedTracks";

import { useWidgetControls } from "../../hooks/useWidgetControls";
import { BUILTIN_LEADER_ACCENT, PROVIDER_SETTINGS_HREFS } from "../constants";
import { LeaderBlock } from "../CustomWidget/LeaderBlock";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { emptyReasonOf, emptyTextKey, formatPlaycount, topTrackItem } from "./helpers";

export function TopTracks({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useListenedTracks(provider);
  const controls = useWidgetControls("none");
  const name = SOURCE_NAMES[provider];
  const tracks = data?.status === "ready" ? data.topTracks : [];
  const items = tracks.map((track) =>
    topTrackItem(
      track,
      track.playcount === null ? null : t("topTracks.plays", { count: formatPlaycount(track.playcount) })
    )
  );
  const reason = emptyReasonOf({ isError, data, empty: items.length === 0 });

  return (
    <WidgetFrame
      icon={Trophy}
      title={t("topTracks.title")}
      subtitle={t("topTracks.subtitle", { provider: name })}
      info={info}
      titleId={`top-tracks-heading-${provider}`}
      loading={isLoading}
      action={
        reason === "unlinked"
          ? { label: t("topTracks.empty.ctaConfigure", { provider: name }), href: PROVIDER_SETTINGS_HREFS[provider] }
          : undefined
      }
      note={reason === null ? null : t(emptyTextKey(reason), { provider: name })}
    >
      <LeaderBlock
        items={items}
        size={size}
        accent={BUILTIN_LEADER_ACCENT}
        controls={controls}
        badge={t("topTracks.heroBadge")}
      />
    </WidgetFrame>
  );
}
