"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { trpc } from "@utils/trpc";
import { useAuthLoading, useCurrentUser } from "@modules/providers/AuthProvider";

/**
 * Client-side gate for the (main) route group. Sends unauthenticated visitors
 * to /login, and redirects to /setup when no admin exists yet. Rendering a
 * null fallback while loading avoids flashing the layout for a tick.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isLoading = useAuthLoading();
  const setupQuery = trpc.auth.setupRequired.useQuery(undefined, {
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (isLoading || setupQuery.isLoading) return;
    if (setupQuery.data === true) {
      router.replace("/setup");
      return;
    }
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, isLoading, router, setupQuery.data, setupQuery.isLoading]);

  if (isLoading || setupQuery.isLoading) return null;
  if (setupQuery.data === true) return null;
  if (!currentUser) return null;

  return <>{children}</>;
}
