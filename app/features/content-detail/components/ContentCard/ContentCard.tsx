"use client";

import { cn } from "@utils/cn";
import { Check, Download } from "lucide-react";
import Image from "next/image";

import { cardRingFillStyle, detailInitials } from "../../helpers";
import {
  cardBody,
  cardButton,
  cardCount,
  cardCountDot,
  cardCover,
  cardScrimBottom,
  cardImage,
  cardInitials,
  cardMarker,
  cardMarkerDownload,
  cardScrim,
  cardRing,
  cardRingCheck,
  cardRingCount,
  cardRingDisc,
  cardRingWrap,
  cardSubtitle,
  cardTitle,
} from "../../styles";
import type { ContentCardProps } from "../../types";

export function ContentCard({ item, onSelect }: ContentCardProps) {
  const fullyInLibrary = item.totalTracks > 0 && item.libraryTrackCount >= item.totalTracks;
  const countState = fullyInLibrary ? "full" : item.libraryTrackCount > 0 ? "partial" : "none";

  return (
    <button type="button" className={cardButton()} onClick={() => onSelect(item)}>
      <div className={cardCover()}>
        {item.image ? (
          <Image src={item.image} alt="" fill sizes="(max-width: 640px) 50vw, 20vw" className={cardImage()} />
        ) : (
          <span aria-hidden className={cardInitials()}>
            {detailInitials(item.title)}
          </span>
        )}

        <span aria-hidden className={cardScrim()} />
        <span aria-hidden className={cardScrimBottom()} />

        {item.totalTracks > 0 ? (
          <span className={cardCount()}>
            <span aria-hidden className={cardCountDot({ state: countState })} />
            {item.libraryTrackCount}/{item.totalTracks}
          </span>
        ) : null}

        {item.inLibrary ? (
          <span className={cardRingWrap()} aria-hidden>
            <span
              className={cn("dock-ring", fullyInLibrary && "dock-ring-complete", cardRing())}
              style={cardRingFillStyle(item.libraryTrackCount, item.totalTracks)}
            />
            <span className={cardRingDisc()}>
              {fullyInLibrary ? (
                <Check className={cardRingCheck()} />
              ) : (
                <span className={cardRingCount()}>{item.libraryTrackCount}</span>
              )}
            </span>
          </span>
        ) : (
          <span className={cardMarker()} aria-hidden>
            <Download className={cardMarkerDownload()} />
          </span>
        )}
      </div>

      <div className={cardBody()}>
        <p className={cardTitle()}>{item.title}</p>
        {item.subtitle ? <p className={cardSubtitle()}>{item.subtitle}</p> : null}
      </div>
    </button>
  );
}
