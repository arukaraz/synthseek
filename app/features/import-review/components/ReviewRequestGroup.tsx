"use client";

import { Disc3, ListMusic } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { ContentType } from "@api/__generated__/types";
import { artworkImage } from "@utils/artworkProxy";

import { requestGroup, requestGroupArt, requestGroupHeader, requestGroupName, requestGroupSub } from "../styles";
import type { ReviewRequestGroupProps } from "../types";
import { ReviewTrackCard } from "./ReviewTrackCard";

export function ReviewRequestGroup({ group, onListen }: ReviewRequestGroupProps) {
  const { t } = useTranslation("requests");
  const { request, tracks } = group;
  const isPlaylist = request.contentType === ContentType.enum.playlist;
  const FallbackIcon = isPlaylist ? ListMusic : Disc3;
  const kind = isPlaylist ? t("labels.playlist") : t("labels.album");
  const sub = [kind, request.artist, t("review.group.tracks", { count: tracks.length })]
    .filter((part) => part !== null && part.length > 0)
    .join(" · ");

  return (
    <li className={requestGroup()}>
      <div className={requestGroupHeader()}>
        <div className={requestGroupArt()} aria-hidden="true">
          {request.art ? (
            <Image {...artworkImage(request.art)} alt="" fill sizes="36px" className="object-cover" />
          ) : (
            <FallbackIcon className="text-fg/40 absolute inset-0 m-auto size-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className={requestGroupName()} title={request.name}>
            {request.name}
          </div>
          <div className={requestGroupSub()}>{sub}</div>
        </div>
      </div>

      {tracks.map((track) => (
        <ReviewTrackCard key={track.track.id} group={track} onListen={onListen} />
      ))}
    </li>
  );
}
