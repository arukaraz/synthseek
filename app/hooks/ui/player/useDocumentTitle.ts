"use client";

import { useEffect } from "react";

import { publishNowPlayingTitle } from "@utils/nowPlayingTitle";

export function usePlayerDocumentTitle(nowPlaying: string | null): void {
  useEffect(() => {
    publishNowPlayingTitle(nowPlaying);
    return () => publishNowPlayingTitle(null);
  }, [nowPlaying]);
}
