import { useEffect, useState } from "react";

import { COUNTDOWN_TICK_MS } from "./constants";

export function useCountdown(deadlineMs: number | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadlineMs === null) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, COUNTDOWN_TICK_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [deadlineMs]);

  if (deadlineMs === null) return 0;
  return Math.max(0, Math.ceil((deadlineMs - now) / 1000));
}
