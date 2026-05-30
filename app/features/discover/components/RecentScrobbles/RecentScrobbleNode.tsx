"use client";

import Image from "next/image";

import { tileGradient } from "@features/discover/components/DiscoveryMixes/helpers";

import { describeScrobbleAge } from "./helpers";
import { node, nodeArtist, nodeCover, nodeDot, nodeFallback, nodeTime, nodeTitle } from "./styles";
import type { RecentScrobbleNodeProps } from "./types";

export function RecentScrobbleNode({ scrobble }: RecentScrobbleNodeProps) {
  const age = describeScrobbleAge(scrobble.playedAt, Date.now());
  const cover = scrobble.albumImage;
  const fallbackBg = tileGradient(scrobble.catalogTrackId);

  return (
    <div className={node()}>
      <span className={nodeTime()}>{age}</span>
      <span className={nodeDot()} aria-hidden />
      <div className={nodeCover()}>
        {cover ? (
          <Image src={cover} alt="" fill sizes="120px" className="object-cover" unoptimized />
        ) : (
          <div style={{ background: fallbackBg }} className={nodeFallback()} />
        )}
      </div>
      <p className={nodeTitle()}>{scrobble.title}</p>
      <p className={nodeArtist()}>{scrobble.artist}</p>
    </div>
  );
}
