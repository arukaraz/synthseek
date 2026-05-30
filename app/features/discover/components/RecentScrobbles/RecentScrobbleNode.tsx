"use client";

import Image from "next/image";

import { tileGradient } from "@features/discover/components/DiscoveryMixes/helpers";

import { describeScrobbleAge } from "./helpers";
import { node, nodeArtist, nodeCover, nodeDot, nodeFallback, nodeTime, nodeTitle } from "./styles";
import type { RecentScrobbleNodeProps } from "./types";

export function RecentScrobbleNode({ candidate }: RecentScrobbleNodeProps) {
  const age = describeScrobbleAge(candidate.playedAt, Date.now());
  const cover = candidate.albumImage;
  const fallbackBg = tileGradient(candidate.catalogTrackId);

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
      <p className={nodeTitle()}>{candidate.title}</p>
      <p className={nodeArtist()}>{candidate.artist}</p>
    </div>
  );
}
