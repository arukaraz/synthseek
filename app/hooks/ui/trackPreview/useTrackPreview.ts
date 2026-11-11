"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { TRACK_PREVIEW } from "./constants";
import { isSounding, statusOf } from "./helpers";
import {
  getServerSnapshot,
  getSnapshot,
  previewClock,
  seekPreview,
  stopPreview,
  subscribe,
  togglePreview,
} from "./store";
import type { PreviewClip, PreviewClock, PreviewNotice, TrackPreview } from "./types";

export function useTrackPreview(clip: PreviewClip): TrackPreview {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const status = statusOf(snapshot, clip.key);
  const playing = status === "playing";
  const [clock, setClock] = useState<PreviewClock | null>(null);
  const { key, subject, src, title, fallbackSeconds } = clip;

  useEffect(() => {
    if (!playing) {
      setClock(null);
      return;
    }
    const read = () => setClock(previewClock(key));
    read();
    const timer = window.setInterval(read, TRACK_PREVIEW.CLOCK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [playing, key]);

  useEffect(() => () => stopPreview(key), [key]);

  const toggle = useCallback(
    () => togglePreview({ key, subject, src, title, fallbackSeconds }),
    [key, subject, src, title, fallbackSeconds]
  );
  const seek = useCallback(
    (seconds: number) => {
      seekPreview(key, seconds);
      setClock(previewClock(key));
    },
    [key]
  );

  return { status, active: isSounding(status), clock, toggle, seek };
}

export function useTrackPreviewNotice(): PreviewNotice | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).notice;
}
