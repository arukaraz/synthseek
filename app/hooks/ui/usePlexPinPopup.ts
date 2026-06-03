"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { PlexPinPhase, UsePlexPinPopupOptions, UsePlexPinPopupResult } from "./types";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;
const DEFAULT_POPUP_BLOCKED_MESSAGE = "Allow popups for this site, then try Plex again.";
const DEFAULT_TIMEOUT_MESSAGE = "Plex login timed out";
const DEFAULT_ERROR_FALLBACK_MESSAGE = "Plex login failed";

export function usePlexPinPopup<TResolved>(options: UsePlexPinPopupOptions<TResolved>): UsePlexPinPopupResult {
  const {
    start: startFlow,
    poll,
    onResolved,
    popupBlockedMessage = DEFAULT_POPUP_BLOCKED_MESSAGE,
    timeoutMessage = DEFAULT_TIMEOUT_MESSAGE,
    errorFallbackMessage = DEFAULT_ERROR_FALLBACK_MESSAGE,
  } = options;

  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onResolvedRef = useRef(onResolved);
  const pollRef = useRef(poll);

  onResolvedRef.current = onResolved;
  pollRef.current = poll;

  const [phase, setPhase] = useState<PlexPinPhase>("idle");

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    popupRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setPhase("idle");
  }, [cleanup]);

  const start = useCallback(async () => {
    try {
      setPhase("pending");
      const { pinId, authUrl } = await startFlow();

      const popup = window.open(authUrl, "_blank", "width=600,height=720");
      if (!popup) {
        cleanup();
        setPhase("error");
        toast.error(popupBlockedMessage);
        return;
      }
      popupRef.current = popup;

      timeoutRef.current = setTimeout(() => {
        cleanup();
        setPhase("error");
        toast.error(timeoutMessage);
      }, POLL_TIMEOUT_MS);

      intervalRef.current = setInterval(async () => {
        try {
          const resolved = await pollRef.current(pinId);
          if (resolved !== null) {
            cleanup();
            setPhase("completed");
            onResolvedRef.current(resolved);
          }
        } catch (error) {
          cleanup();
          setPhase("error");
          toast.error(error instanceof Error ? error.message : errorFallbackMessage);
        }
      }, POLL_INTERVAL_MS);
    } catch (error) {
      cleanup();
      setPhase("error");
      toast.error(error instanceof Error ? error.message : errorFallbackMessage);
    }
  }, [cleanup, errorFallbackMessage, popupBlockedMessage, startFlow, timeoutMessage]);

  return { start, reset, phase, isPending: phase === "pending" };
}
