"use client";

import { usePlaybackSession, useSavePlaybackPosition, useSavePlaybackSession } from "@hooks/api";
import { useEffect, useRef } from "react";

import { setTakeOverHandler, setUnknownTrackHandler } from "./commands";
import { SESSION_SAVE_INTERVAL_MS } from "./constants";
import { playerTrackFrom, queueChanged, queueRewritten, sessionChanged } from "./helpers";
import { actions, getSnapshot, sessionSnapshot, subscribe } from "./store";
import type { SessionSnapshot } from "./types";

export function usePlayerSessionSync(): void {
  const restored = useRef(false);
  const lastSaved = useRef<SessionSnapshot | null>(null);
  const lastSentAt = useRef(0);
  const queueRevision = useRef<string | null>(null);
  const session = usePlaybackSession(!restored.current);
  const { mutate: saveSession } = useSavePlaybackSession();
  const { mutate: savePosition } = useSavePlaybackPosition();

  useEffect(() => {
    if (restored.current || session.data === undefined || session.data === null) return;
    restored.current = true;
    queueRevision.current = session.data.queueRevision;
    lastSaved.current = {
      trackIds: session.data.tracks.map((track) => track.id),
      autoplayTrackIds: session.data.autoplayTrackIds,
      currentTrackId: session.data.currentTrackId,
      positionMs: session.data.positionMs,
    };
    actions.restoreSession(
      session.data.tracks.filter((track) => track.playable).map(playerTrackFrom),
      session.data.currentTrackId,
      session.data.positionMs / 1000,
      session.data.resumedFrom,
      session.data.autoplayTrackIds
    );
  }, [session.data]);

  const refetch = session.refetch;
  useEffect(() => {
    setTakeOverHandler(() => {
      if (actions.playHere()) return;
      void refetch().then((result) => {
        const handed = result.data;
        if (handed === undefined || handed === null) return;
        actions.takeOver(
          handed.tracks.filter((track) => track.playable).map(playerTrackFrom),
          handed.currentTrackId,
          handed.positionMs / 1000,
          handed.autoplayTrackIds
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
        actions.adoptQueue(
          shared.tracks.filter((track) => track.playable).map(playerTrackFrom),
          trackId,
          shared.autoplayTrackIds
        );
      });
    });
    return () => setUnknownTrackHandler(null);
  }, [refetch]);

  useEffect(() => {
    let trailing: ReturnType<typeof setTimeout> | undefined;

    const saveWhole = (snapshot: SessionSnapshot) => {
      queueRevision.current = null;
      saveSession(snapshot, {
        onSuccess: (saved) => {
          queueRevision.current = saved.queueRevision;
        },
      });
    };

    const flush = (force: boolean) => {
      const session = getSnapshot();
      if (!session.started || session.remote !== null) return;
      const throttled = !force && Date.now() - lastSentAt.current < SESSION_SAVE_INTERVAL_MS;
      const next = sessionSnapshot();
      if (next.trackIds.length === 0) return;
      if (!sessionChanged(lastSaved.current, next)) return;
      if (throttled && !queueChanged(lastSaved.current, next)) {
        if (trailing === undefined) {
          trailing = setTimeout(
            () => {
              trailing = undefined;
              flush(false);
            },
            SESSION_SAVE_INTERVAL_MS - (Date.now() - lastSentAt.current)
          );
        }
        return;
      }
      const rewritten = queueRewritten(lastSaved.current, next);
      const revision = queueRevision.current;
      lastSaved.current = next;
      lastSentAt.current = Date.now();
      if (rewritten || revision === null) {
        saveWhole(next);
        return;
      }
      savePosition(
        { queueRevision: revision, currentTrackId: next.currentTrackId, positionMs: next.positionMs },
        {
          onSuccess: (answer) => {
            if (answer.saved) return;
            queueRevision.current = null;
            lastSaved.current = null;
            flush(true);
          },
        }
      );
    };

    const unsubscribe = subscribe(() => flush(false));
    const onLeave = () => flush(true);
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    window.addEventListener("pagehide", onLeave);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      clearTimeout(trailing);
      unsubscribe();
      window.removeEventListener("pagehide", onLeave);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [saveSession, savePosition]);
}
