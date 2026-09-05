"use client";

import { useRecordPlay } from "@hooks/api";
import { useEffect, useRef } from "react";

import { accumulateListen, beginListen, listenIsDue, listenRestarted, startedSecondsAgo } from "./helpers";
import { getSnapshot, subscribe } from "./store";
import type { ListenProgress } from "./types";

export function usePlayReporter(): void {
  const { mutate: recordPlay } = useRecordPlay();
  const listen = useRef<ListenProgress | null>(null);

  useEffect(() => {
    return subscribe(() => {
      const session = getSnapshot();
      const track = session.queue[session.index] ?? null;
      if (track === null || !session.playing) return;

      const previous = listen.current;
      const restarted = previous !== null && listenRestarted(previous, session.positionSeconds);
      if (previous === null || previous.trackId !== track.id || restarted) {
        listen.current = beginListen(track.id, Date.now(), session.positionSeconds);
        recordPlay({ trackId: track.id, startedSecondsAgo: 0, submission: false });
        return;
      }

      const progress = accumulateListen(previous, session.positionSeconds);
      listen.current = progress;
      if (!listenIsDue(progress, session.durationSeconds || track.durationSeconds)) return;

      listen.current = { ...progress, recorded: true };
      recordPlay({
        trackId: track.id,
        startedSecondsAgo: startedSecondsAgo(progress, Date.now()),
        submission: true,
      });
    });
  }, [recordPlay]);
}
