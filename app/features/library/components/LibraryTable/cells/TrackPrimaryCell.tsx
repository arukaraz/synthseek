"use client";

import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { artworkProxySrc } from "@utils/artworkProxy";
import { Music } from "lucide-react";
import Image from "next/image";

import { primaryCellRow, primaryCellText, primaryCellTitle } from "../styles";
import type { TrackPrimaryCellProps } from "./types";

export function TrackPrimaryCell({ item }: TrackPrimaryCellProps) {
  return (
    <div className={primaryCellRow()}>
      {item.albumArt ? (
        <Image src={artworkProxySrc(item.albumArt)} alt="" width={40} height={40} className="rounded-md object-cover" />
      ) : (
        <ImagePlaceholder size="sm" icon={Music} />
      )}
      <div className={primaryCellText()}>
        <p className={primaryCellTitle()}>{item.title}</p>
      </div>
    </div>
  );
}
