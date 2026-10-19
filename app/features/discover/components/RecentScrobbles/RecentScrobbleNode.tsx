"use client";

import { CoverArt } from "../WidgetRow/CoverArt";
import { describeScrobbleAge } from "./helpers";
import { node, nodeArtist, nodeCover, nodeDot, nodeTime, nodeTitle } from "./styles";
import type { RecentScrobbleNodeProps } from "./types";

export function RecentScrobbleNode({ scrobble }: RecentScrobbleNodeProps) {
  const age = describeScrobbleAge(scrobble.playedAt, Date.now());

  return (
    <div className={node()}>
      <span className={nodeTime()}>{age}</span>
      <span className={nodeDot()} aria-hidden />
      <div className={nodeCover()}>
        <CoverArt src={scrobble.albumImage} seed={scrobble.catalogTrackId} sizes="120px" />
      </div>
      <p className={nodeTitle()}>{scrobble.title}</p>
      <p className={nodeArtist()}>{scrobble.artist}</p>
    </div>
  );
}
