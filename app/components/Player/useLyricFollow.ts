"use client";

import { animate } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { LYRIC_RESUME_DELAY_MS, LYRIC_SCROLL_SPRING } from "./constants";
import { centredScrollTop, lineInView } from "./helpers";
import type { LyricFollow, LyricFollowOptions } from "./types";

export function useLyricFollow({ activeLine, active, reduceMotion, mode }: LyricFollowOptions): LyricFollow {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const following = useRef(true);
  const lastReaderScroll = useRef(0);
  const placedOn = useRef<HTMLDivElement | null>(null);
  const motion = useRef<AnimationPlaybackControls | null>(null);
  const [lost, setLost] = useState(false);

  const scrollToActive = useCallback(
    (instant: boolean) => {
      const line = activeLine.current;
      if (container === null || line === null) return;
      motion.current?.stop();
      const target = centredScrollTop(container, line);
      if (instant || reduceMotion) {
        container.scrollTop = target;
        return;
      }
      motion.current = animate(container.scrollTop, target, {
        ...LYRIC_SCROLL_SPRING,
        onUpdate: (value) => {
          container.scrollTop = value;
        },
      });
    },
    [container, activeLine, reduceMotion]
  );

  const refreshLost = useCallback(() => {
    const line = activeLine.current;
    if (mode === "always" || container === null || line === null) {
      setLost(false);
      return;
    }
    setLost((mode === "off" || !following.current) && !lineInView(container, line));
  }, [container, activeLine, mode]);

  useEffect(() => {
    if (container === null) return;
    const yieldToReader = () => {
      motion.current?.stop();
      if (mode === "always") return;
      following.current = false;
      lastReaderScroll.current = Date.now();
      refreshLost();
    };
    const onScroll = () => {
      if (mode !== "always") refreshLost();
    };
    container.addEventListener("wheel", yieldToReader, { passive: true });
    container.addEventListener("touchstart", yieldToReader, { passive: true });
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("wheel", yieldToReader);
      container.removeEventListener("touchstart", yieldToReader);
      container.removeEventListener("scroll", onScroll);
    };
  }, [container, mode, refreshLost]);

  useEffect(() => {
    if (mode !== "reader" || following.current) return;
    following.current = true;
    scrollToActive(false);
    setLost(false);
  }, [mode, scrollToActive]);

  useEffect(() => {
    const line = activeLine.current;
    if (container === null || line === null) return;
    const first = placedOn.current !== container;
    placedOn.current = container;
    if (mode === "always") {
      scrollToActive(false);
      return;
    }
    if (mode === "reader") {
      const settled = Date.now() - lastReaderScroll.current > LYRIC_RESUME_DELAY_MS;
      if (!following.current && settled && lineInView(container, line)) following.current = true;
      if (following.current) scrollToActive(false);
    } else if (first) {
      scrollToActive(true);
    }
    refreshLost();
  }, [active, mode, container, activeLine, scrollToActive, refreshLost]);

  useEffect(() => () => motion.current?.stop(), []);

  const returnToLine = useCallback(() => {
    following.current = true;
    scrollToActive(false);
    setLost(false);
  }, [scrollToActive]);

  return { lost, returnToLine, scrollerRef: setContainer };
}
