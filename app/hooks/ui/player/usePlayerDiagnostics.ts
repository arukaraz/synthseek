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
    let heldUntil = 0;

    const handBack = (events: readonly RecordedDiagnostic[]) => {
      for (const event of events) recordDiagnostic(event);
    };

    const inputOf = (batch: readonly RecordedDiagnostic[]) => {
      const now = Date.now();
      return { deviceId: currentDeviceId(), events: batch.map((event) => sendable(event, now)) };
    };

    const schedule = () => {
      if (timer !== undefined) return;
      timer = setTimeout(flush, Math.max(DIAGNOSTICS.FLUSH_DELAY_MS, heldUntil - Date.now()));
    };

    const flush = () => {
      clearTimeout(timer);
      timer = undefined;
      if (sending || queued.length === 0) return;
      if (Date.now() < heldUntil) {
        schedule();
        return;
      }
      const batch = queued.splice(0, DIAGNOSTICS.MAX_BATCH);
      sending = true;
      report(inputOf(batch), {
        onSuccess: ({ dropped }) => {
          sending = false;
          failedAttempts = 0;
          if (dropped > 0) {
            queued.unshift(...batch.slice(batch.length - dropped));
            queued.splice(DIAGNOSTICS.MAX_BUFFERED);
            heldUntil = Date.now() + DIAGNOSTICS.CAP_WINDOW_MS;
          }
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
      });
    };

    const flushBeforeLeaving = () => {
      if (Date.now() < heldUntil) return;
      clearTimeout(timer);
      timer = undefined;
      while (queued.length > 0) report(inputOf(queued.splice(0, DIAGNOSTICS.MAX_BATCH)));
    };

    setDiagnosticsSink((event) => {
      queued.push(event);
      if (queued.length > DIAGNOSTICS.MAX_BUFFERED) queued.shift();
      if (queued.length >= DIAGNOSTICS.MAX_BATCH) flush();
      else schedule();
    });

    const onHidden = () => {
      if (document.visibilityState === "hidden") flushBeforeLeaving();
    };
    window.addEventListener("pagehide", flushBeforeLeaving);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      setDiagnosticsSink(null);
      window.removeEventListener("pagehide", flushBeforeLeaving);
      document.removeEventListener("visibilitychange", onHidden);
      flush();
      handBack(queued.splice(0));
    };
  }, [report]);
}
