"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WORKSHOP_KEY_COMMIT_MS } from "../components/PlaylistWorkshop/constants";
import { arrangeTracks, sameOrder } from "../components/PlaylistWorkshop/helpers";
import type { PlaylistOrder, SaveOrder, WorkshopTrack } from "../components/PlaylistWorkshop/types";

export function usePlaylistOrder(tracks: readonly WorkshopTrack[], save: SaveOrder): PlaylistOrder {
  const [draft, setDraft] = useState<string[] | null>(null);
  const draftRef = useRef<string[] | null>(null);
  const ticketRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef<{ ids: string[]; done: Promise<void> } | null>(null);
  const storedIds = useMemo(() => tracks.map((track) => track.requestId), [tracks]);
  const storedRef = useRef(storedIds);
  storedRef.current = storedIds;

  const ordered = useMemo(() => arrangeTracks(tracks, draft), [tracks, draft]);

  const arrange = useCallback((ids: string[]) => {
    ticketRef.current += 1;
    draftRef.current = ids;
    setDraft(ids);
  }, []);

  const commit = useCallback((): Promise<void> => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    const ids = draftRef.current;
    if (ids === null) return Promise.resolve();
    const saving = savingRef.current;
    if (saving !== null && saving.ids === ids) return saving.done;
    const ticket = ticketRef.current;
    const settle = () => {
      if (ticketRef.current !== ticket) return;
      draftRef.current = null;
      setDraft(null);
    };
    if (sameOrder(ids, storedRef.current)) {
      settle();
      return Promise.resolve();
    }
    const done = new Promise<void>((resolve) => {
      save(ids, () => {
        if (savingRef.current?.ids === ids) savingRef.current = null;
        settle();
        resolve();
      });
    });
    savingRef.current = { ids, done };
    return done;
  }, [save]);

  const place = useCallback(
    (ids: string[]) => {
      arrange(ids);
      void commit();
    },
    [arrange, commit]
  );

  const placeSoon = useCallback(
    (ids: string[]) => {
      arrange(ids);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void commit(), WORKSHOP_KEY_COMMIT_MS);
    },
    [arrange, commit]
  );

  useEffect(
    () => () => {
      if (timerRef.current !== null) void commit();
    },
    [commit]
  );

  return { ordered, arrange, commit, place, placeSoon };
}
