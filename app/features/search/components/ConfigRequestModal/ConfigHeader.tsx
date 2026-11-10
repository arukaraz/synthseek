"use client";

import { Badge } from "@components/ui/Badge";
import { ContentType } from "@api/__generated__/types";
import { getContentTypeIcon, getContentTypeLabel } from "@utils/content-type-helpers";
import { artworkImage } from "@utils/artworkProxy";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { configHeaderCover, configHeaderMeta, configHeaderRow, configHeaderText, configHeaderTitle } from "./styles";
import type { ConfigHeaderProps } from "./types";

export function ConfigHeader({ name, artist, image, year, itemType, totalTracks, albumName }: ConfigHeaderProps) {
  const { t } = useTranslation("search");
  const PlaceholderIcon = getContentTypeIcon(itemType);
  const meta = [
    artist,
    itemType === ContentType.enum.track ? albumName : undefined,
    year,
    totalTracks ? t("config.header.trackCount", { count: totalTracks }) : undefined,
  ]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" · ");

  return (
    <div className={configHeaderRow()} data-cy="config-header">
      <div className={configHeaderCover()}>
        {image ? (
          <Image {...artworkImage(image)} alt={name} fill sizes="56px" className="object-cover" priority />
        ) : (
          <PlaceholderIcon className="text-fg/50 size-6" />
        )}
      </div>
      <div className={configHeaderText()}>
        <Badge className={`type-badge type-badge-${itemType}`}>{getContentTypeLabel(itemType)}</Badge>
        <h2 className={configHeaderTitle()} data-cy="config-item-title">
          {name}
        </h2>
        {meta ? <p className={configHeaderMeta()}>{meta}</p> : null}
      </div>
    </div>
  );
}
