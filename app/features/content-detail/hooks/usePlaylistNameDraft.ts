"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { WORKSHOP_NAME_SAVE_MS } from "../components/PlaylistWorkshop/constants";
import type { PlaylistNameDraft, SaveName } from "../components/PlaylistWorkshop/types";

export function usePlaylistNameDraft(name: string, save: SaveName): PlaylistNameDraft {
  const [draft, setDraft] = useState(name);
  const [syncedName, setSyncedName] = useState(name);
  const [busy, setBusy] = useState(false);
  const draftRef = useRef(name);
  const savedRef = useRef(name);
  const nameRef = useRef(name);
  nameRef.current = name;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const inFlightRef = useRef(0);

  if (!busy && syncedName !== name) {
    setSyncedName(name);
    savedRef.current = name;
    if (name !== draft.trim()) {
      draftRef.current = name;
      setDraft(name);
    }
  }

  const commit = useCallback((): Promise<void> => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    const next = draftRef.current.trim();
    if (next.length === 0 || next === savedRef.current) {
      if (inFlightRef.current === 0) setBusy(false);
      return chainRef.current;
    }
    savedRef.current = next;
    inFlightRef.current += 1;
    const done = chainRef.current
      .then(() => save(next))
      .catch(() => {
        if (savedRef.current === next) savedRef.current = nameRef.current;
        if (draftRef.current.trim() !== next) return;
        draftRef.current = nameRef.current;
        setDraft(nameRef.current);
      })
      .then(() => {
        inFlightRef.current -= 1;
        if (inFlightRef.current === 0 && timerRef.current === null) setBusy(false);
      });
    chainRef.current = done;
    return done;
  }, [save]);

  const change = useCallback(
    (value: string) => {
      draftRef.current = value;
      setDraft(value);
      setBusy(true);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void commit(), WORKSHOP_NAME_SAVE_MS);
    },
    [commit]
  );

  const finish = useCallback((): Promise<void> => {
    if (draftRef.current.trim().length === 0) {
      draftRef.current = savedRef.current;
      setDraft(savedRef.current);
    }
    return commit();
  }, [commit]);

  const revert = useCallback(
    (previous: string): Promise<void> => {
      draftRef.current = previous;
      setDraft(previous);
      return commit();
    },
    [commit]
  );

  useEffect(
    () => () => {
      if (timerRef.current !== null) void commit();
    },
    [commit]
  );

  const typed = draft.trim();

  return { draft, shown: typed.length > 0 ? typed : name, change, finish, commit, revert };
}
