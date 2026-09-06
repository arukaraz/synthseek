"use client";

import { useEffect } from "react";

import { APP_TITLE } from "@components/Player";

export function usePlayerDocumentTitle(nowPlaying: string | null): void {
  useEffect(() => {
    document.title = nowPlaying ?? APP_TITLE;
    return () => {
      document.title = APP_TITLE;
    };
  }, [nowPlaying]);
}
