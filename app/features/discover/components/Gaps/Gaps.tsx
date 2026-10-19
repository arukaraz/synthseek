"use client";

import { Disc3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem, albumTarget, artistTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useDiscographyGaps } from "@hooks/api/queries/analytics/useDiscographyGaps";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { GapCard } from "./GapCard";
import { gapsBody, gapsGrid } from "./styles";

export function Gaps({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useDiscographyGaps();
  const { openForTarget, requestResult } = useContentRequestFlow();
  const gaps = data ?? [];

  return (
    <WidgetFrame
      icon={Disc3}
      title={t("gaps.title")}
      subtitle={t("gaps.subtitle")}
      info={info}
      titleId="gaps-heading"
      loading={isLoading}
      note={isError ? t("history.error") : gaps.length === 0 ? t("gaps.empty") : null}
    >
      <div className={gapsBody()}>
        <FadeScroll>
          <div className={gapsGrid()}>
            {gaps.map((gap) => (
              <GapCard
                key={gap.artist}
                gap={gap}
                onOpen={(album) =>
                  openForTarget(
                    albumTarget({ id: album.id, name: album.name, artistName: album.artist, cover: album.cover })
                  )
                }
                onRequest={(album) =>
                  requestResult(
                    albumRequestItem({ id: album.id, name: album.name, artistName: album.artist, cover: album.cover })
                  )
                }
                onOpenArtist={() =>
                  openForTarget(artistTarget({ id: gap.artistId, name: gap.artist, cover: gap.cover }))
                }
              />
            ))}
          </div>
        </FadeScroll>
      </div>
    </WidgetFrame>
  );
}
