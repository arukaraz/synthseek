"use client";

import { useRadioTracksFetcher } from "@hooks/api";
import { useEffect, useRef } from "react";

import { AUTOPLAY_BATCH } from "./constants";
import { autoplayDue, autoplaySeeds, autoplaySignature, playerTrackFrom } from "./helpers";
import { actions, getSnapshot, subscribe } from "./store";

export function useAutoplayFill(): void {
  const fetchRadio = useRadioTracksFetcher();
  const pending = useRef(false);
  const refused = useRef<string | null>(null);

  useEffect(() => {
    return subscribe(() => {
      const session = getSnapshot();
      if (pending.current || !autoplayDue(session)) return;
      const signature = autoplaySignature(session);
      if (refused.current === signature) return;
      const seeds = autoplaySeeds(session, Math.random);
      if (seeds.length === 0) return;

      pending.current = true;
      fetchRadio({
        seed: { kind: "tracks", trackIds: seeds },
        excludeTrackIds: session.queue.map((track) => track.id),
        count: AUTOPLAY_BATCH,
      })
        .then((result) => {
          const tracks = result.items.map(playerTrackFrom);
          if (tracks.length === 0 || actions.appendAutoplay(tracks).added === 0) refused.current = signature;
        })
        .catch(() => {
          refused.current = signature;
        })
        .finally(() => {
          pending.current = false;
        });
    });
  }, [fetchRadio]);
}
