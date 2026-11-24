"use client";

import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { RequestSplitButton } from "@components/RequestSplitButton";
import { SOURCE_NAMES } from "@components/SourceBadge";
import { WidgetFrame } from "@components/WidgetFrame";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { LovedTrack } from "@hooks/api/queries/analytics/types";
import { useLovedNotHere } from "@hooks/api/queries/analytics/useLovedNotHere";

import { COMPACT_ROW_LIMIT, LOVED_TITLE_KEYS, PROVIDER_SETTINGS_HREFS } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function LovedNotHere({ size, info, provider = "lastfm" }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useLovedNotHere(provider);
  const { openForResult, requestResult } = useContentRequestFlow();
  const name = SOURCE_NAMES[provider];
  const compact = size === "S";
  const unlinked = data?.status === "unlinked";
  const inactive = data?.status === "inactive";
  const tracks: LovedTrack[] = data?.status === "ready" ? data.tracks : [];
  const shown = compact ? tracks.slice(0, COMPACT_ROW_LIMIT) : tracks;

  return (
    <WidgetFrame
      icon={Heart}
      title={t(LOVED_TITLE_KEYS[provider])}
      subtitle={t("loved.subtitle", { provider: name })}
      info={info}
      titleId={`loved-heading-${provider}`}
      loading={isLoading}
      action={unlinked ? { label: t("loved.link"), href: PROVIDER_SETTINGS_HREFS[provider] } : undefined}
      note={
        isError
          ? t("board.loadError")
          : inactive
            ? t("board.providerInactive", { provider: name })
            : unlinked
              ? t("loved.unlinked", { provider: name })
              : tracks.length === 0
                ? t("loved.empty")
                : null
      }
    >
      <FadeScroll>
        <ul className={widgetList({ columns: listColumns(size) })}>
          {shown.map((track) => (
            <WidgetRow
              key={track.id}
              cover={track.album.images[0]?.url ?? null}
              seed={track.id}
              title={track.title}
              subtitle={track.artist}
              onSelect={() => openForResult(track)}
              coverAction={
                compact
                  ? {
                      kind: "request",
                      name: track.title,
                      onClick: () => requestResult(track, "direct"),
                      onCustomize: () => requestResult(track, "customize"),
                    }
                  : undefined
              }
              trailing={
                compact ? undefined : (
                  <RequestSplitButton
                    name={track.title}
                    label={t("loved.request")}
                    size="sm"
                    onRequest={() => requestResult(track, "direct")}
                    onCustomize={() => requestResult(track, "customize")}
                  />
                )
              }
            />
          ))}
        </ul>
      </FadeScroll>
    </WidgetFrame>
  );
}
