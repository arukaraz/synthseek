"use client";

import { useCallback, useRef } from "react";

import { GRID_JUMP_MAX_FRAMES } from "../constants";
import { scrollChildToTop } from "../helpers";

export function useGridJump(scrollRoot: HTMLElement | null, loadThrough: (offset: number) => Promise<void>) {
  const tokenRef = useRef(0);

  return useCallback(
    async (offset: number) => {
      const token = ++tokenRef.current;
      await loadThrough(offset);
      for (let frame = 0; frame < GRID_JUMP_MAX_FRAMES; frame += 1) {
        if (token !== tokenRef.current || !scrollRoot) return;
        if (scrollChildToTop(scrollRoot, offset)) return;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    },
    [scrollRoot, loadThrough]
  );
}
