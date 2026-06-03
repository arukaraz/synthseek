"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { AuthTransitionValue } from "../types";

const AuthTransitionContext = createContext<AuthTransitionValue | null>(null);

export function AuthTransitionProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  const markNavigating = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const value = useMemo<AuthTransitionValue>(() => ({ isNavigating, markNavigating }), [isNavigating, markNavigating]);

  return <AuthTransitionContext.Provider value={value}>{children}</AuthTransitionContext.Provider>;
}

export function useAuthTransition(): AuthTransitionValue {
  const ctx = useContext(AuthTransitionContext);
  if (!ctx) throw new Error("useAuthTransition must be used within AuthTransitionProvider");
  return ctx;
}
