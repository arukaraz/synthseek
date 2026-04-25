"use client";

import { createContext, useContext, type ReactNode } from "react";

import { trpc } from "@utils/trpc";
import { isAdminFE } from "@utils/authorization";
import type { PublicUser } from "@api/__generated__/types";

interface AuthContextValue {
  currentUser: PublicUser | null;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides the currently authenticated user via `trpc.auth.me.useQuery`.
 * Must be rendered inside TRPCProvider (it calls a tRPC hook).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const currentUser = meQuery.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading: meQuery.isLoading,
        isAdmin: isAdminFE(currentUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

export function useCurrentUser(): PublicUser | null {
  return useAuthContext().currentUser;
}

export function useIsAdmin(): boolean {
  return useAuthContext().isAdmin;
}

export function useAuthLoading(): boolean {
  return useAuthContext().isLoading;
}
