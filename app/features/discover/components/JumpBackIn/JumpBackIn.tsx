"use client";

import { Disc3, History } from "lucide-react";
import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeader } from "@components/WidgetHeader";
import { useJumpBackIn } from "@hooks/api/queries/analytics/useJumpBackIn";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { PlaySetCard } from "../PlaySetCard/PlaySetCard";
import { CARD_ROW_SKELETONS } from "../constants";
import { cardRowLimit } from "../helpers";
import { cardRow, cardRowBody, cardRowSkeleton, widgetNote } from "../styles";
import type { JumpBackInProps } from "./types";

export function JumpBackIn({ size, info }: JumpBackInProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useJumpBackIn();
  const { playEntity } = useEntityPlayback();
  const limit = cardRowLimit(size);
  const albums = (data ?? []).slice(0, limit);

  return (
    <section className={glassPanelCard({ height: "auto" })} aria-labelledby="jump-back-in-heading">
      <WidgetHeader
        icon={History}
        title={t("jumpBackIn.title")}
        subtitle={t("jumpBackIn.subtitle")}
        titleId="jump-back-in-heading"
        info={info}
      />
      {isLoading ? (
        <div className={cardRowBody()}>
          <div className={cardRow()}>
            {CARD_ROW_SKELETONS.slice(0, limit).map((index) => (
              <div key={index} className={cardRowSkeleton()} />
            ))}
          </div>
        </div>
      ) : isError || albums.length === 0 ? (
        <p className={widgetNote()}>{isError ? t("history.error") : t("jumpBackIn.empty")}</p>
      ) : (
        <div className={cardRowBody()}>
          <div className={cardRow()}>
            {albums.map((album) => (
              <PlaySetCard
                key={album.albumExternalId}
                accent="weekly"
                icon={Disc3}
                tag={album.artist}
                title={album.name}
                blurb={null}
                footnote={t("jumpBackIn.progress", { played: album.playedTracks, total: album.totalTracks })}
                covers={album.cover ? [album.cover] : []}
                seed={album.albumExternalId}
                playLabel={t("history.play", { name: album.name })}
                onPlay={() => void playEntity({ kind: "album", albumExternalId: album.albumExternalId })}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
