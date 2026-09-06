"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { HEADER_SLOT_QUERY, PLAYER_HEADER_SLOT_ID, PLAYER_MODE_ATTRIBUTE } from "./constants";
import { effectivePlayerMode } from "./helpers";
import { miniWindowBody, subscribeMiniWindow } from "./miniWindow";
import type { PlayerMode, PlayerPlacement } from "./types";

function serverSnapshot(): HTMLElement | null {
  return null;
}

function useHeaderSlot(wanted: boolean): HTMLElement | null {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!wanted) {
      setSlot(null);
      return;
    }
    const wide = window.matchMedia(HEADER_SLOT_QUERY);
    const resolve = () => {
      setSlot(wide.matches ? document.getElementById(PLAYER_HEADER_SLOT_ID) : null);
    };
    resolve();
    wide.addEventListener("change", resolve);
    return () => {
      wide.removeEventListener("change", resolve);
    };
  }, [wanted]);

  return slot;
}

export function usePlayerPlacement(mode: PlayerMode, suspended: boolean): PlayerPlacement {
  const headerSlot = useHeaderSlot(mode === "compact" && !suspended);
  const miniBody = useSyncExternalStore(subscribeMiniWindow, miniWindowBody, serverSnapshot);
  const target = mode === "mini" ? miniBody : headerSlot;
  const effective = effectivePlayerMode(mode, target);

  useEffect(() => {
    document.documentElement.setAttribute(PLAYER_MODE_ATTRIBUTE, effective);
    return () => {
      document.documentElement.removeAttribute(PLAYER_MODE_ATTRIBUTE);
    };
  }, [effective]);

  return { target, effective };
}
