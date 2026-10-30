"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

import { REDUCED_MOTION_QUERY } from "../constants";
import { useMediaQuery } from "../useMediaQuery";
import { measureTiles, slideTiles } from "./helpers";
import type { BoardFlip, TilePosition, UseBoardFlipOptions } from "./types";

export function useBoardFlip({ orderKey, skipId }: UseBoardFlipOptions): BoardFlip {
  const ref = useRef<HTMLElement | null>(null);
  const rects = useRef<Map<HTMLElement, TilePosition>>(new Map());
  const slidUntil = useRef(0);
  const lastOrder = useRef(orderKey);
  const stillness = useMediaQuery(REDUCED_MOTION_QUERY);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const changed = orderKey !== lastOrder.current;
    lastOrder.current = orderKey;
    if (!changed || stillness) {
      rects.current = measureTiles(container);
      return;
    }
    const result = slideTiles(container, rects.current, skipId, performance.now());
    rects.current = result.rects;
    slidUntil.current = result.slidUntil;
  }, [orderKey, skipId, stillness]);

  const settling = useCallback(() => performance.now() < slidUntil.current, []);

  return { ref, settling };
}
