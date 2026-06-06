"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { UseAutoRetryOptions, UseAutoRetryResult } from "./types";

const DEFAULT_BASE_DELAY_MS = 3000;
const DEFAULT_MAX_DELAY_MS = 30000;

export function useAutoRetry(options: UseAutoRetryOptions): UseAutoRetryResult {
  const { onRetry, baseDelayMs = DEFAULT_BASE_DELAY_MS, maxDelayMs = DEFAULT_MAX_DELAY_MS } = options;

  const onRetryRef = useRef(onRetry);
  onRetryRef.current = onRetry;

  const attemptRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const clearPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const fireAndReschedule = useCallback(
    function run() {
      setIsRetrying(true);
      onRetryRef.current();

      const delay = Math.min(baseDelayMs * 2 ** attemptRef.current, maxDelayMs);
      attemptRef.current += 1;
      timeoutRef.current = setTimeout(run, delay);
    },
    [baseDelayMs, maxDelayMs]
  );

  const arm = useCallback(() => {
    const delay = Math.min(baseDelayMs * 2 ** attemptRef.current, maxDelayMs);
    attemptRef.current += 1;
    timeoutRef.current = setTimeout(fireAndReschedule, delay);
  }, [baseDelayMs, maxDelayMs, fireAndReschedule]);

  useEffect(() => {
    arm();
    return clearPending;
  }, [arm, clearPending]);

  const retryNow = useCallback(() => {
    clearPending();
    fireAndReschedule();
  }, [clearPending, fireAndReschedule]);

  return { retryNow, isRetrying };
}
