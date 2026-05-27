"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { trpc } from "@utils/trpc";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

type PlexLoginState = "idle" | "pending" | "completed" | "error";

export function usePlexLogin() {
  const utils = trpc.useUtils();
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<PlexLoginState>("idle");

  const startMutation = trpc.auth.plexStart.useMutation();
  const completeMutation = trpc.auth.plexComplete.useMutation();

  const cleanup = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startLogin = useCallback(async () => {
    try {
      setState("pending");
      const { pinId, authUrl } = await startMutation.mutateAsync();
      popupRef.current = window.open(authUrl, "_blank", "width=600,height=720");

      timeoutRef.current = setTimeout(() => {
        cleanup();
        setState("error");
        toast.error("Plex login timed out");
      }, POLL_TIMEOUT_MS);

      intervalRef.current = setInterval(async () => {
        try {
          const result = await completeMutation.mutateAsync({ pinId });
          if (result.status === "authenticated") {
            cleanup();
            utils.auth.me.setData(undefined, result.user);
            setState("completed");
          }
        } catch (error) {
          cleanup();
          setState("error");
          const message = error instanceof Error ? error.message : "Plex login failed";
          toast.error(message);
        }
      }, POLL_INTERVAL_MS);
    } catch (error) {
      setState("error");
      const message = error instanceof Error ? error.message : "Plex login failed";
      toast.error(message);
    }
  }, [cleanup, completeMutation, startMutation, utils.auth.me]);

  return { startLogin, state, isPending: state === "pending" };
}
