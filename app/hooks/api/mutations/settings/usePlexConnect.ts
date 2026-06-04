"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import i18n from "@locale";
import { errorToast } from "@modules/errors";
import { trpc } from "@utils/trpc";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 2 * 60 * 1000;

interface PlexServerOption {
  name: string;
  clientIdentifier: string;
  uri: string;
  local: boolean;
}

type ConnectState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "picking"; token: string; servers: PlexServerOption[] }
  | { kind: "saving" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export function usePlexConnect() {
  const utils = trpc.useUtils();
  const startMutation = trpc.settings.plexConnectStart.useMutation();
  const pollMutation = trpc.settings.plexConnectPoll.useMutation();
  const saveMutation = trpc.settings.plexConnectSave.useMutation();

  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<ConnectState>({ kind: "idle" });

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
    setState({ kind: "idle" });
  }, [cleanup]);

  const start = useCallback(async () => {
    try {
      setState({ kind: "pending" });
      const { pinId, authUrl } = await startMutation.mutateAsync();
      popupRef.current = window.open(authUrl, "_blank", "width=600,height=720");

      timeoutRef.current = setTimeout(() => {
        cleanup();
        const message = i18n.t("mutations:plexConnect.timedOut");
        setState({ kind: "error", message });
        toast.error(message);
      }, POLL_TIMEOUT_MS);

      intervalRef.current = setInterval(async () => {
        try {
          const result = await pollMutation.mutateAsync({ pinId });
          if (result.status === "ready") {
            cleanup();
            setState({ kind: "picking", token: result.token, servers: result.servers });
          }
        } catch (error) {
          cleanup();
          const message = error instanceof Error ? error.message : i18n.t("mutations:plexConnect.loginFailed");
          setState({ kind: "error", message });
          errorToast(error, "plexConnect.loginFailed");
        }
      }, POLL_INTERVAL_MS);
    } catch (error) {
      const message = error instanceof Error ? error.message : i18n.t("mutations:plexConnect.loginFailed");
      setState({ kind: "error", message });
      errorToast(error, "plexConnect.loginFailed");
    }
  }, [cleanup, pollMutation, startMutation]);

  const saveServer = useCallback(
    async (uri: string) => {
      if (state.kind !== "picking") return;
      setState({ kind: "saving" });
      try {
        await saveMutation.mutateAsync({ url: uri, token: state.token });
        await utils.settings.get.invalidate();
        await utils.settings.plexStatus.invalidate();
        setState({ kind: "done" });
        toast.success(i18n.t("mutations:plexConnect.connected"));
      } catch (error) {
        const message = error instanceof Error ? error.message : i18n.t("mutations:plexConnect.saveFailed");
        setState({ kind: "error", message });
        errorToast(error, "plexConnect.saveFailed");
      }
    },
    [saveMutation, state, utils.settings.get, utils.settings.plexStatus]
  );

  return { state, start, saveServer, reset };
}
