"use client";

import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { RequestSplitButton } from "@components/RequestSplitButton";
import { WidgetFrame } from "@components/WidgetFrame";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { LovedTrack } from "@hooks/api/queries/analytics/types";
import { useLovedNotHere } from "@hooks/api/queries/analytics/useLovedNotHere";

import { COMPACT_ROW_LIMIT, LASTFM_SETTINGS_HREF } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function LovedNotHere({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useLovedNotHere();
  const { openForResult, requestResult } = useContentRequestFlow();
  const compact = size === "S";
  const unlinked = data?.status === "unlinked";
  const tracks: LovedTrack[] = data?.status === "ready" ? data.tracks : [];
  const shown = compact ? tracks.slice(0, COMPACT_ROW_LIMIT) : tracks;

  return (
    <WidgetFrame
      icon={Heart}
      title={t("loved.title")}
      subtitle={t("loved.subtitle")}
      info={info}
      titleId="loved-heading"
      loading={isLoading}
      action={unlinked ? { label: t("loved.link"), href: LASTFM_SETTINGS_HREF } : undefined}
      note={
        isError ? t("board.loadError") : unlinked ? t("loved.unlinked") : tracks.length === 0 ? t("loved.empty") : null
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
