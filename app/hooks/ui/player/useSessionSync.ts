"use client";

import { usePlaybackSession, useSavePlaybackSession } from "@hooks/api";
import { useEffect, useRef } from "react";

import { setTakeOverHandler, setUnknownTrackHandler } from "./commands";
import { SESSION_SAVE_INTERVAL_MS } from "./constants";
import { playerTrackFrom, sessionChanged } from "./helpers";
import { actions, getSnapshot, sessionSnapshot, subscribe } from "./store";
import type { SessionSnapshot } from "./types";

export function usePlayerSessionSync(): void {
  const restored = useRef(false);
  const lastSaved = useRef<SessionSnapshot | null>(null);
  const lastSentAt = useRef(0);
  const session = usePlaybackSession(!restored.current);
  const { mutate: saveSession } = useSavePlaybackSession();

  useEffect(() => {
    if (restored.current || session.data === undefined || session.data === null) return;
    restored.current = true;
    lastSaved.current = {
      trackIds: session.data.tracks.map((track) => track.id),
      currentTrackId: session.data.currentTrackId,
      positionMs: session.data.positionMs,
    };
    actions.restoreSession(
      session.data.tracks.filter((track) => track.playable).map(playerTrackFrom),
      session.data.currentTrackId,
      session.data.positionMs / 1000,
      session.data.resumedFrom
    );
  }, [session.data]);

  const refetch = session.refetch;
  useEffect(() => {
    setTakeOverHandler(() => {
      void refetch().then((result) => {
        const handed = result.data;
        if (handed === undefined || handed === null) return;
        actions.takeOver(
          handed.tracks.filter((track) => track.playable).map(playerTrackFrom),
          handed.currentTrackId,
          handed.positionMs / 1000
        );
      });
    });
    return () => setTakeOverHandler(null);
  }, [refetch]);

  useEffect(() => {
    setUnknownTrackHandler((trackId) => {
      if (getSnapshot().queue.some((track) => track.id === trackId)) return;
      void refetch().then((result) => {
        const shared = result.data;
        if (shared === undefined || shared === null) return;
        actions.adoptQueue(shared.tracks.filter((track) => track.playable).map(playerTrackFrom), trackId);
      });
    });
    return () => setUnknownTrackHandler(null);
  }, [refetch]);

  useEffect(() => {
    const flush = (force: boolean) => {
      if (!getSnapshot().started) return;
      if (!force && Date.now() - lastSentAt.current < SESSION_SAVE_INTERVAL_MS) return;
      const next = sessionSnapshot();
      if (next.trackIds.length === 0) return;
      if (!sessionChanged(lastSaved.current, next)) return;
      lastSaved.current = next;
      lastSentAt.current = Date.now();
      saveSession(next);
    };

    const unsubscribe = subscribe(() => flush(false));
    const onLeave = () => flush(true);
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [saveSession]);
}
