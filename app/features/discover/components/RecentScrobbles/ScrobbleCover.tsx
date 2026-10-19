"use client";

import Image from "next/image";

import { tileGradient } from "@features/discover/components/DiscoveryMixes/helpers";
import { artworkProxySrc } from "@utils/artworkProxy";

import { nodeFallback } from "./styles";
import type { ScrobbleCoverProps } from "./types";

export function ScrobbleCover({ scrobble, sizes }: ScrobbleCoverProps) {
  const cover = scrobble.albumImage;
  if (cover) {
    return <Image src={artworkProxySrc(cover)} alt="" fill sizes={sizes} className="object-cover" unoptimized />;
  }
  return <div style={{ background: tileGradient(scrobble.catalogTrackId) }} className={nodeFallback()} />;
}
