"use client";

import { FadeScroll } from "@components/FadeScroll";

import { CoverArt } from "../WidgetRow/CoverArt";
import { describeScrobbleAge } from "./helpers";
import {
  timeline,
  timelineScroller,
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
    <FadeScroll className={timelineScroller()}>
      <ol className={timeline()}>
        {scrobbles.map((scrobble) => (
          <li key={scrobble.catalogTrackId} className={timelineRow()}>
            <span className={timelineTime()}>{describeScrobbleAge(scrobble.playedAt, nowMs)}</span>
            <span className={timelineNode()} aria-hidden>
              <span className={timelineDot()} />
            </span>
            <span className={timelineCover()}>
              <CoverArt src={scrobble.albumImage} seed={scrobble.catalogTrackId} sizes="36px" />
            </span>
            <span className={timelineCopy()}>
              <span className={timelineTitle()}>{scrobble.title}</span>
              <span className={timelineArtist()}>{scrobble.artist}</span>
            </span>
          </li>
        ))}
      </ol>
    </FadeScroll>
  );
}
