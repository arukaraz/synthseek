"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { generateUuid } from "@utils/uuid";

const ClientSessionIdContext = createContext<string | null>(null);

/**
 * Generates a UUID once when the tab mounts and exposes it via context. The
 * tRPC link pulls this value to tag every mutation with a correlation id so
 * the tab can later identify its own events.
 */
export function ClientSessionIdProvider({ children }: { children: ReactNode }) {
  const [clientSessionId] = useState(() => generateUuid());
  return <ClientSessionIdContext.Provider value={clientSessionId}>{children}</ClientSessionIdContext.Provider>;
}

export function useClientSessionId(): string {
  const value = useContext(ClientSessionIdContext);
  if (!value) throw new Error("useClientSessionId must be used within ClientSessionIdProvider");
  return value;
}
