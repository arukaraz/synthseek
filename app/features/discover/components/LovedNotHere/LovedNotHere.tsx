"use client";

import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { LovedTrack } from "@hooks/api/queries/analytics/types";
import { useLovedNotHere } from "@hooks/api/queries/analytics/useLovedNotHere";

import { LASTFM_SETTINGS_HREF } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetAction } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function LovedNotHere({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useLovedNotHere();
  const { openForResult } = useContentRequestFlow();
  const unlinked = data?.status === "unlinked";
  const tracks: LovedTrack[] = data?.status === "ready" ? data.tracks : [];

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
        isError ? t("history.error") : unlinked ? t("loved.unlinked") : tracks.length === 0 ? t("loved.empty") : null
      }
    >
      <ul className={widgetList()}>
        {tracks.map((track) => (
          <WidgetRow
            key={track.id}
            cover={track.album.images[0]?.url ?? null}
            seed={track.id}
            title={track.title}
            subtitle={track.artist}
            trailing={
              <button type="button" className={widgetAction()} onClick={() => openForResult(track)}>
                {t("loved.request")}
              </button>
            }
          />
        ))}
      </ul>
    </WidgetFrame>
  );
}
