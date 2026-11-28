"use client";

import { useEffect, useState } from "react";

import type { PlexPinSession } from "@hooks/ui/types";

import { PIN_EXPIRY_WARNING_MS } from "./constants";

export function usePinExpiry(session: PlexPinSession | null): boolean {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (session === null) return;
    const warnAt = session.expiresAt - PIN_EXPIRY_WARNING_MS;
    const wait = Math.max(0, warnAt - Date.now());
    const timer = setTimeout(() => setNow(Date.now()), wait);
    return () => clearTimeout(timer);
  }, [session]);

  return session !== null && session.expiresAt - now <= PIN_EXPIRY_WARNING_MS;
}
