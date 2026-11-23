"use client";

import { useReportPlayerDiagnostics } from "@hooks/api";
import { useEffect } from "react";

import { DIAGNOSTICS } from "./constants";
import { currentDeviceId } from "./device";
import { recordDiagnostic, sendable, setDiagnosticsSink } from "./diagnostics";
import type { RecordedDiagnostic } from "./types";

export function usePlayerDiagnostics(): void {
  const { mutate: report } = useReportPlayerDiagnostics();

  useEffect(() => {
    const queued: RecordedDiagnostic[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sending = false;
    let failedAttempts = 0;

    const handBack = (events: readonly RecordedDiagnostic[]) => {
      for (const event of events) recordDiagnostic(event);
    };

    const schedule = () => {
      if (timer === undefined) timer = setTimeout(flush, DIAGNOSTICS.FLUSH_DELAY_MS);
    };

    const flush = () => {
      clearTimeout(timer);
      timer = undefined;
      if (sending || queued.length === 0) return;
      const batch = queued.splice(0, DIAGNOSTICS.MAX_BATCH);
      const now = Date.now();
      sending = true;
      report(
        { deviceId: currentDeviceId(), events: batch.map((event) => sendable(event, now)) },
        {
          onSuccess: () => {
            sending = false;
            failedAttempts = 0;
            if (queued.length > 0) schedule();
          },
          onError: () => {
            sending = false;
            failedAttempts += 1;
            if (failedAttempts < DIAGNOSTICS.MAX_SEND_ATTEMPTS) queued.unshift(...batch);
            else failedAttempts = 0;
            queued.splice(DIAGNOSTICS.MAX_BUFFERED);
            if (queued.length > 0) schedule();
          },
        }
      );
    };

    setDiagnosticsSink((event) => {
      queued.push(event);
      if (queued.length > DIAGNOSTICS.MAX_BUFFERED) queued.shift();
      if (queued.length >= DIAGNOSTICS.MAX_BATCH) flush();
      else schedule();
    });

    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      setDiagnosticsSink(null);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHidden);
      flush();
      handBack(queued.splice(0));
    };
  }, [report]);
}
