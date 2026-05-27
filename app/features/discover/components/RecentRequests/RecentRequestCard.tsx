"use client";

import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { StatusBadge } from "@components/ui/StatusBadge";
import type { FlatTrackRow } from "@features/requests/types";
import { formatRelativeTime } from "@utils/formatters";
import { Disc } from "lucide-react";
import Image from "next/image";
import { cardBase } from "./styles";

interface RecentRequestCardProps {
  request: FlatTrackRow;
}

export function RecentRequestCard({ request }: RecentRequestCardProps) {
  const parentArt = request.parent.album_art;
  const timeAgo = formatRelativeTime(new Date(request.created_at));

  return (
    <article className={cardBase()}>
      <div className="flex items-center justify-between">
        <span className="text-fg/60 font-mono text-[10px]">{timeAgo}</span>
        <StatusBadge status={request.status} size="sm" showIcon />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
          {parentArt ? (
            <Image
              src={parentArt}
              alt={`Album art for ${request.parent.name}`}
              fill
              className="object-cover"
              sizes="48px"
              loading="lazy"
            />
          ) : (
            <ImagePlaceholder size="md" icon={Disc} />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-fg line-clamp-1 text-sm font-medium">{request.title}</div>
          <div className="text-fg/60 line-clamp-1 text-xs">{request.parent.name}</div>
        </div>
      </div>
    </article>
  );
}
