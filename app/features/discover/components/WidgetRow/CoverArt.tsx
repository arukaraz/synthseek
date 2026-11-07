"use client";

import Image from "next/image";

import { artworkImage } from "@utils/artworkProxy";

import { tileGradient } from "../DiscoveryMixes/helpers";
import { coverFallback } from "./styles";
import type { CoverArtProps } from "./types";

export function CoverArt({ src, seed, sizes }: CoverArtProps) {
  if (src) {
    return <Image {...artworkImage(src)} alt="" fill sizes={sizes} className="object-cover" />;
  }
  return <span style={{ background: tileGradient(seed) }} className={coverFallback()} />;
}
