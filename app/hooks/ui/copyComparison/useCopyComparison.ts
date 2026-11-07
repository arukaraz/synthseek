"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { playerActions } from "@hooks/ui/player";

import { COPY_COMPARISON } from "./constants";
import { clampTo, copyTimeAt, copyVolume, lengthOf, loopAround, startOf, timelineBounds } from "./helpers";
import type { ComparedCopy, CopyComparison, TimelineBounds } from "./types";

function start(element: HTMLAudioElement): void {
  try {
    void Promise.resolve(element.play()).catch(() => undefined);
  } catch {
    return;
  }
}

function alignTo(element: HTMLAudioElement, seconds: number, exact: boolean): void {
  if (element.seeking) return;
  const drift = Math.abs(element.currentTime - seconds);
  if (exact ? drift > 0 : drift > COPY_COMPARISON.DRIFT_TOLERANCE_SECONDS) element.currentTime = seconds;
}

function isAdvancing(element: HTMLAudioElement): boolean {
  return !element.paused && !element.seeking && element.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

export function useCopyComparison(copies: readonly ComparedCopy[]): CopyComparison {
  const elements = useRef(new Map<string, HTMLAudioElement>());
  const [durations, setDurations] = useState<ReadonlyMap<string, number>>(() => new Map());
  const [sounding, setSounding] = useState<ReadonlySet<string>>(() => new Set(copies.slice(0, 1).map((c) => c.id)));
  const [aligned, setAligned] = useState(false);
  const [matched, setMatched] = useState(true);
  const [loop, setLoop] = useState<TimelineBounds | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [failedSources, setFailedSources] = useState<ReadonlySet<string>>(() => new Set());
  const clock = useRef({ origin: 0, at: 0 });

  const bounds = useMemo(() => timelineBounds(copies, aligned, durations), [copies, aligned, durations]);
  const latest = useRef({ copies, sounding, aligned, matched, loop, playing, position, bounds, durations });
  latest.current = { copies, sounding, aligned, matched, loop, playing, position, bounds, durations };

  const sourceKey = copies.map((copy) => `${copy.id}:${copy.src}`).join("|");

  useEffect(() => {
    const map = elements.current;
    for (const copy of latest.current.copies) {
      const element = new Audio();
      element.preload = "metadata";
      element.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(element.duration)) {
          setDurations((previous) => new Map(previous).set(copy.id, element.duration));
        }
      });
      element.addEventListener("error", () => {
        setFailedSources((previous) => new Set(previous).add(copy.src));
        setSounding((previous) => {
          if (!previous.has(copy.id)) return previous;
          const next = new Set(previous);
          next.delete(copy.id);
          return next;
        });
        if (!latest.current.sounding.has(copy.id)) return;
        setPlaying(false);
        for (const other of map.values()) other.pause();
      });
      element.src = copy.src;
      map.set(copy.id, element);
    }
    return () => {
      for (const element of map.values()) {
        element.pause();
        element.removeAttribute("src");
      }
      map.clear();
    };
  }, [sourceKey]);

  const place = useCallback((at: number, audible: boolean, exact: boolean) => {
    const state = latest.current;
    for (const copy of state.copies) {
      const element = elements.current.get(copy.id);
      if (element === undefined) continue;
      element.volume = copyVolume(copy, state.copies, state.sounding, state.matched);
      const seconds = copyTimeAt(at, copy, state.aligned);
      const inside = seconds >= 0 && seconds < lengthOf(copy, state.durations);
      if (!state.sounding.has(copy.id) || !inside) {
        if (!element.paused) element.pause();
        continue;
      }
      alignTo(element, seconds, exact);
      if (audible && element.paused) start(element);
      if (!audible && !element.paused) element.pause();
    }
  }, []);

  const leaderAt = useCallback((): number | null => {
    const state = latest.current;
    for (const copy of state.copies) {
      const element = elements.current.get(copy.id);
      if (element === undefined || !state.sounding.has(copy.id) || !isAdvancing(element)) continue;
      return startOf(copy, state.aligned) + element.currentTime;
    }
    return null;
  }, []);

  useEffect(() => {
    place(latest.current.position, latest.current.playing, false);
  }, [sounding, matched, aligned, place]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const state = latest.current;
      const now = performance.now();
      let at = leaderAt() ?? clock.current.origin + (now - clock.current.at) / 1000;
      clock.current = { origin: at, at: now };
      if (state.loop !== null && at >= state.loop.end) {
        at = state.loop.start;
        clock.current = { origin: at, at: now };
        setPosition(at);
        place(at, true, true);
        frame = requestAnimationFrame(tick);
        return;
      }
      if (at >= state.bounds.end) {
        setPlaying(false);
        setPosition(state.bounds.end);
        place(state.bounds.end, false, false);
        return;
      }
      setPosition(at);
      place(at, true, false);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, place, leaderAt]);

  const seek = useCallback(
    (target: number) => {
      const at = clampTo(target, latest.current.bounds);
      clock.current = { origin: at, at: performance.now() };
      setPosition(at);
      place(at, latest.current.playing, true);
    },
    [place]
  );

  const toggle = useCallback(() => {
    const state = latest.current;
    if (state.playing) {
      setPlaying(false);
      place(state.position, false, false);
      return;
    }
    playerActions.pauseHere();
    const from = state.position >= state.bounds.end ? state.bounds.start : state.position;
    clock.current = { origin: from, at: performance.now() };
    setPosition(from);
    setPlaying(true);
    place(from, true, true);
  }, [place]);

  const stop = useCallback(() => {
    setPlaying(false);
    place(latest.current.position, false, false);
  }, [place]);

  const broken = useMemo(
    () => new Set(copies.filter((copy) => failedSources.has(copy.src)).map((copy) => copy.id)),
    [copies, failedSources]
  );
  const latestBroken = useRef(broken);
  latestBroken.current = broken;

  const toggleCopy = useCallback((id: string) => {
    if (latestBroken.current.has(id)) return;
    setSounding((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleLoop = useCallback(() => {
    const state = latest.current;
    setLoop(state.loop === null ? loopAround(state.position, state.bounds) : null);
  }, []);

  return {
    playing,
    position,
    bounds,
    aligned,
    matched,
    loop,
    sounding,
    broken,
    durations,
    toggle,
    seek,
    toggleCopy,
    setAligned,
    setMatched,
    toggleLoop,
    stop,
  };
}
