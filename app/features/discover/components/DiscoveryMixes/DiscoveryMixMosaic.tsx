"use client";

import Image from "next/image";

import { tileGradient } from "./helpers";
import { mosaicFallback, mosaicGrid, mosaicImage, mosaicTile } from "./styles";
import type { DiscoveryMixMosaicProps } from "./types";

export function DiscoveryMixMosaic({ candidates, fallbackSeed }: DiscoveryMixMosaicProps) {
  const images = candidates.map((candidate) => candidate.albumImage).filter((url): url is string => Boolean(url));

  if (images.length === 0) {
    const background = tileGradient(fallbackSeed);
    return <div style={{ background }} className={mosaicFallback()} />;
  }

  const tiles: Array<string | null> = [...images.slice(0, 4)];
  while (tiles.length < 4) tiles.push(null);

  return (
    <div className={mosaicGrid()}>
      {tiles.map((url, index) => {
        const key = `${fallbackSeed}-${index}`;
        if (url) {
          return (
            <div key={key} className={mosaicTile()}>
              <Image src={url} alt="" fill sizes="120px" className={mosaicImage()} unoptimized />
            </div>
          );
        }
        const background = tileGradient(key);
        return <div key={key} style={{ background }} className={mosaicTile()} />;
      })}
    </div>
  );
}
