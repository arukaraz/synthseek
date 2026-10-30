"use client";

import Image from "next/image";

import { artworkProxySrc } from "@utils/artworkProxy";

import { tileGradient } from "./helpers";
import { mosaicFallback, mosaicGrid, mosaicImage, mosaicTile } from "./styles";
import type { DiscoveryMixMosaicProps } from "./types";

export function DiscoveryMixMosaic({ covers: images, fallbackSeed, shape = "square" }: DiscoveryMixMosaicProps) {
  if (images.length === 0) {
    const background = tileGradient(fallbackSeed);
    return <div style={{ background }} className={mosaicFallback()} />;
  }

  const tiles: Array<string | null> = [...images.slice(0, 4)];
  while (tiles.length < 4) tiles.push(null);

  return (
    <div className={mosaicGrid({ shape })}>
      {tiles.map((url, index) => {
        const key = `${fallbackSeed}-${index}`;
        if (url) {
          return (
            <div key={key} className={mosaicTile()}>
              <Image src={artworkProxySrc(url)} alt="" fill sizes="120px" className={mosaicImage()} unoptimized />
            </div>
          );
        }
        const background = tileGradient(key);
        return <div key={key} style={{ background }} className={mosaicTile()} />;
      })}
    </div>
  );
}
