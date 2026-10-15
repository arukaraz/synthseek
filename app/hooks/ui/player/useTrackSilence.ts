"use client";

import { useTrackSilenceFetcher } from "@hooks/api";
import { useEffect } from "react";

import { claimUnaskedSilence, rememberSilence } from "./silence";
import { silenceCandidates, subscribe } from "./store";

export function useTrackSilence(): void {
  const fetchSilence = useTrackSilenceFetcher();

  useEffect(() => {
    return subscribe(() => {
      const wanted = claimUnaskedSilence(silenceCandidates());
      if (wanted.length === 0) return;
      fetchSilence({ trackIds: wanted })
        .then(rememberSilence)
        .catch(() => undefined);
    });
  }, [fetchSilence]);
}
