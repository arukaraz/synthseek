"use client";

import { Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";

import { COMPACT_ROW_LIMIT } from "../constants";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";
import { trendingArtist, trendingTitle } from "./helpers";
import type { TrendingListProps } from "./types";

export function TrendingList({ entries, info, loading, failed }: TrendingListProps) {
  const { t } = useTranslation("discover");
  const { openForResult, requestResult } = useContentRequestFlow();

  return (
    <WidgetFrame
      icon={Zap}
      title={t("trendingHero.badge")}
      subtitle=""
      info={info}
      titleId="trending-heading"
      loading={loading}
      note={failed ? t("trendingHero.errorTitle") : null}
    >
      <FadeScroll>
        <ol className={widgetList()}>
          {entries.slice(0, COMPACT_ROW_LIMIT).map(({ track }, index) => {
            const title = trendingTitle(track);
            return (
              <WidgetRow
                key={track.id}
                cover={track.images?.[0]?.url ?? null}
                seed={track.id}
                title={title}
                subtitle={trendingArtist(track)}
                lead={index + 1}
                onSelect={() => openForResult(track)}
                coverAction={{
                  kind: "request",
                  label: t("trendingHero.requestAriaLabel", { title }),
                  onClick: () => requestResult(track),
                }}
              />
            );
          })}
        </ol>
      </FadeScroll>
    </WidgetFrame>
  );
}
