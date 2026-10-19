"use client";

import Image from "next/image";

import { artworkProxySrc } from "@utils/artworkProxy";

import { tileGradient } from "../DiscoveryMixes/helpers";
import { coverFallback } from "./styles";
import type { CoverArtProps } from "./types";

export function CoverArt({ src, seed, sizes }: CoverArtProps) {
  if (src) {
    return <Image src={artworkProxySrc(src)} alt="" fill sizes={sizes} className="object-cover" unoptimized />;
  }
  return <span style={{ background: tileGradient(seed) }} className={coverFallback()} />;
}
