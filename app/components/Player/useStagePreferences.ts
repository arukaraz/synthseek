"use client";

import { useCallback } from "react";

import { useLocalStorage } from "@hooks/ui/useLocalStorage";

import { LYRICS_AUTO_SCROLL_STORAGE_KEY, STAGE_CHIPS_STORAGE_KEY } from "./constants";
import { isOnOff, isShownHidden } from "./helpers";
import type { StagePreferences } from "./types";

export function useStagePreferences(): StagePreferences {
  const [chips, setChips] = useLocalStorage(STAGE_CHIPS_STORAGE_KEY, "shown", isShownHidden);
  const [autoScroll, setAutoScrollRaw] = useLocalStorage(LYRICS_AUTO_SCROLL_STORAGE_KEY, "on", isOnOff);
  const chipsShown = chips === "shown";

  const toggleChips = useCallback(() => setChips(chipsShown ? "hidden" : "shown"), [setChips, chipsShown]);
  const setAutoScroll = useCallback((next: boolean) => setAutoScrollRaw(next ? "on" : "off"), [setAutoScrollRaw]);

  return { chipsShown, toggleChips, autoScroll: autoScroll === "on", setAutoScroll };
}
