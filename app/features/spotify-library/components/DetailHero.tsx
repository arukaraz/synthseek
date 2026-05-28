"use client";

import { IconButton } from "@components/ui/IconButton";
import { ArrowLeft, Check, ExternalLink, Heart } from "lucide-react";

import {
  detailAct,
  detailActions,
  detailBy,
  detailCoverImg,
  detailCoverPlaceholderLg,
  detailCoverRow,
  detailCrumb,
  detailH2,
  detailHeartImg,
  detailHero,
} from "../styles";
import type { DetailHeroProps } from "./types";

export function DetailHero({
  itemType,
  imported,
  importedTarget,
  onToggleImport,
  externalUrl,
  name,
  crumb,
  byline,
  image,
  onBack,
}: DetailHeroProps) {
  const primaryLabel = imported
    ? importedTarget
      ? "Imported · selected"
      : "Imported · unselect"
    : importedTarget
      ? "Selected for import"
      : "Select for import";

  return (
    <div className={detailHero()}>
      {onBack && (
        <IconButton
          icon={ArrowLeft}
          variant="default"
          size="md"
          aria-label="Back to library list"
          onClick={onBack}
          className="absolute top-3 left-3 z-10 md:hidden"
        />
      )}
      <div className={detailCrumb()}>{crumb}</div>
      <div className={detailCoverRow()}>
        {itemType === "liked" ? (
          <div className={detailHeartImg()}>
            <Heart className="size-9" />
          </div>
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className={detailCoverImg()} />
        ) : (
          <div className={detailCoverPlaceholderLg()} aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <h2 className={detailH2()}>{name}</h2>
          <div className={detailBy()}>{byline}</div>
        </div>
      </div>
      <div className={detailActions()}>
        <button type="button" className={detailAct({ primary: importedTarget })} onClick={onToggleImport}>
          <Check className="size-3.5" strokeWidth={2.5} />
          {primaryLabel}
        </button>
        <a
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          className={detailAct()}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="size-3.5" />
          Open in Spotify
        </a>
      </div>
    </div>
  );
}
