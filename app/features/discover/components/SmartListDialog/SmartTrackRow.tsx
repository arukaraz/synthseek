"use client";

import { Ban, Heart, UserX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { useSetFavoriteTrack } from "@hooks/api/mutations/playback/useSetFavoriteTrack";
import { useRateTrack } from "@hooks/api/mutations/widgets/useSetListActions";
import { useBanArtist, useBanTrack } from "@hooks/api/mutations/widgets/useVetoActions";
import { formatTrackDuration } from "@utils/formatters";

import { CoverArt } from "../WidgetRow/CoverArt";
import { RatingStars } from "./RatingStars";
import { row, rowActions, rowCopy, rowCover, rowSub, rowTime, rowTitle } from "./styles";
import type { SmartTrackRowProps } from "./types";

export function SmartTrackRow({ track }: SmartTrackRowProps) {
  const { t } = useTranslation("discover");
  const favorite = useSetFavoriteTrack();
  const rate = useRateTrack();
  const banTrack = useBanTrack();
  const banArtist = useBanArtist();
  const toggleFavorite = () => favorite.mutate({ trackId: track.id, favorite: !track.favorite });

  return (
    <div className={row()}>
      <span className={rowCover()}>
        <CoverArt src={track.cover} seed={track.id} sizes="36px" />
      </span>
      <span className={rowCopy()}>
        <span className={rowTitle()}>{track.title}</span>
        <span className={rowSub()}>{t("smartList.byline", { artist: track.artist, album: track.album })}</span>
      </span>
      <span className={rowTime()}>{formatTrackDuration(track.durationMs)}</span>
      <RatingStars
        label={t("smartList.rateTrack", { title: track.title })}
        rating={track.rating}
        onChange={(rating) => rate.mutate({ trackId: track.id, rating })}
      />
      <span className={rowActions()}>
        <IconButton
          icon={Heart}
          size="sm"
          animated={false}
          aria-pressed={track.favorite}
          aria-label={t("smartList.favorite", { title: track.title })}
          onClick={toggleFavorite}
        />
        <IconButton
          icon={Ban}
          size="sm"
          animated={false}
          aria-label={t("smartList.banTrack", { name: track.title })}
          title={t("smartList.banTrack", { name: track.title })}
          onClick={() => banTrack.mutate({ trackId: track.id })}
        />
        <IconButton
          icon={UserX}
          size="sm"
          animated={false}
          aria-label={t("smartList.banArtist", { name: track.artist })}
          title={t("smartList.banArtist", { name: track.artist })}
          onClick={() => banArtist.mutate({ artist: track.artist })}
        />
      </span>
    </div>
  );
}
