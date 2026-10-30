"use client";

import { Download, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { Button } from "@components/ui/Button";
import { WidgetFrame } from "@components/WidgetFrame";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { LovedTrack } from "@hooks/api/queries/analytics/types";
import { useLovedNotHere } from "@hooks/api/queries/analytics/useLovedNotHere";

import { COMPACT_ROW_LIMIT, LASTFM_SETTINGS_HREF } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { listColumns } from "../helpers";
import { widgetList, widgetRowButton } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function LovedNotHere({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useLovedNotHere();
  const { openForResult } = useContentRequestFlow();
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
                      label: t("requestNamed", { name: track.title }),
                      onClick: () => openForResult(track),
                    }
                  : undefined
              }
              trailing={
                compact ? undefined : (
                  <Button size="sm" variant="accent" className={widgetRowButton()} onClick={() => openForResult(track)}>
                    <Download />
                    {t("loved.request")}
                  </Button>
                )
              }
            />
          ))}
        </ul>
      </FadeScroll>
    </WidgetFrame>
  );
}
