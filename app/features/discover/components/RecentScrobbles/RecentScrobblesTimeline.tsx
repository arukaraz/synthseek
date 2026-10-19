"use client";

import { cn } from "@utils/cn";

import { scrollFadeBottom } from "../styles";
import { describeScrobbleAge } from "./helpers";
import { ScrobbleCover } from "./ScrobbleCover";
import {
  timeline,
  timelineArtist,
  timelineCopy,
  timelineCover,
  timelineDot,
  timelineNode,
  timelineRow,
  timelineTime,
  timelineTitle,
} from "./styles";
import type { RecentScrobblesTimelineProps } from "./types";

export function RecentScrobblesTimeline({ scrobbles }: RecentScrobblesTimelineProps) {
  const nowMs = Date.now();

  return (
    <ol className={cn(timeline(), scrollFadeBottom())}>
      {scrobbles.map((scrobble) => (
        <li key={scrobble.catalogTrackId} className={timelineRow()}>
          <span className={timelineTime()}>{describeScrobbleAge(scrobble.playedAt, nowMs)}</span>
          <span className={timelineNode()} aria-hidden>
            <span className={timelineDot()} />
          </span>
          <span className={timelineCover()}>
            <ScrobbleCover scrobble={scrobble} sizes="36px" />
          </span>
          <span className={timelineCopy()}>
            <span className={timelineTitle()}>{scrobble.title}</span>
            <span className={timelineArtist()}>{scrobble.artist}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
