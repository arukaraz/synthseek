"use client";

import { useEffect, useState } from "react";

import { STAGE_ACTIVITY_EVENTS, STAGE_CHROME_SELECTOR, STAGE_IDLE_MS, STAGE_OVERLAY_SELECTOR } from "./constants";

export function useStageIdle(enabled: boolean): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIdle(false);
      return;
    }
    let timer = 0;
    let keyboard = false;
    const stayAwake = () =>
      document.querySelector(STAGE_OVERLAY_SELECTOR) !== null ||
      (keyboard && document.activeElement?.closest(STAGE_CHROME_SELECTOR) != null);
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (stayAwake()) arm();
        else setIdle(true);
      }, STAGE_IDLE_MS);
    };
    const wake = () => {
      setIdle(false);
      arm();
    };
    const onKey = () => {
      keyboard = true;
      wake();
    };
    const onPointer = () => {
      keyboard = false;
      wake();
    };
    for (const name of STAGE_ACTIVITY_EVENTS) window.addEventListener(name, wake, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    arm();
    return () => {
      window.clearTimeout(timer);
      for (const name of STAGE_ACTIVITY_EVENTS) window.removeEventListener(name, wake);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [enabled]);

  return idle;
}
