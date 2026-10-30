"use client";

import { Disc3 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FadeScroll } from "@components/FadeScroll";
import { WidgetFrame } from "@components/WidgetFrame";
import { albumRequestItem, albumTarget, artistTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { DiscographyGap } from "@hooks/api/queries/analytics/types";
import { useDiscographyGaps } from "@hooks/api/queries/analytics/useDiscographyGaps";

import { COMPACT_ROW_LIMIT } from "../constants";
import type { BoardWidgetProps } from "../ExploreBoard/types";
import { railScroller } from "../styles";
import { GapCard } from "./GapCard";
import { GapHeader } from "./GapHeader";
import { gapsBody, gapsList, gapsRail } from "./styles";

export function Gaps({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useDiscographyGaps();
  const { openForTarget, requestResult } = useContentRequestFlow();
  const gaps = data ?? [];
  const openArtist = (gap: DiscographyGap) =>
    openForTarget(artistTarget({ id: gap.artistId, name: gap.artist, cover: gap.cover }));

  return (
    <WidgetFrame
      icon={Disc3}
      title={t("gaps.title")}
      subtitle={t("gaps.subtitle")}
      info={info}
      titleId="gaps-heading"
      loading={isLoading}
      note={isError ? t("board.loadError") : gaps.length === 0 ? t("gaps.empty") : null}
    >
      {size === "S" ? (
        <FadeScroll>
          <ul className={gapsList()}>
            {gaps.slice(0, COMPACT_ROW_LIMIT).map((gap) => (
              <li key={gap.artist}>
                <GapHeader gap={gap} onOpenArtist={() => openArtist(gap)} />
              </li>
            ))}
          </ul>
        </FadeScroll>
      ) : (
        <div className={gapsBody()}>
          <FadeScroll axis="x" arrows className={railScroller()} label={t("gaps.rail")}>
            <div className={gapsRail()}>
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
                      albumRequestItem({
                        id: album.id,
                        name: album.name,
                        artistName: album.artist,
                        cover: album.cover,
                      })
                    )
                  }
                  onOpenArtist={() => openArtist(gap)}
                />
              ))}
            </div>
          </FadeScroll>
        </div>
      )}
    </WidgetFrame>
  );
}
