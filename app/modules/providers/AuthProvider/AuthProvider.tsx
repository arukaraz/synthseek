"use client";

import { createContext, useContext, type ReactNode } from "react";

import { trpc } from "@utils/trpc";
import { isAdminFE } from "@utils/authorization";
import type { AuthContextValue } from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

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
        isError: meQuery.isError,
        isAdmin: isAdminFE(currentUser),
        refetch: () => {
          void meQuery.refetch();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
