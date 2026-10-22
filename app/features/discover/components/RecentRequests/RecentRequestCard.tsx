"use client";

import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { StatusBadge } from "@components/StatusBadge";
import { formatRelativeTime } from "@utils/formatters";
import { artworkProxySrc } from "@utils/artworkProxy";
import { Disc } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { cardArt, cardBadge, cardBase, cardCopy, cardMain, cardParent, cardTime, cardTitle } from "./styles";
import type { RecentRequestCardProps } from "./types";

export function RecentRequestCard({ request }: RecentRequestCardProps) {
  const { t } = useTranslation("discover");
  const parentArt = request.parent.album_art;
  const timeAgo = formatRelativeTime(new Date(request.created_at));

  return (
    <article className={cardBase()}>
      <span className={cardTime()}>{timeAgo}</span>
      <div className={cardBadge()}>
        <StatusBadge status={request.status} size="sm" showIcon />
      </div>
      <div className={cardMain()}>
        <div className={cardArt()}>
          {parentArt ? (
            <Image
              src={artworkProxySrc(parentArt)}
              alt={t("recentRequests.albumArtAlt", { name: request.parent.name })}
              fill
              className="object-cover"
              sizes="48px"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder size="md" icon={Disc} />
          )}
        </div>
        <div className={cardCopy()}>
          <div className={cardTitle()}>{request.title}</div>
          <div className={cardParent()}>{request.parent.name}</div>
        </div>
      </div>
    </article>
  );
}
