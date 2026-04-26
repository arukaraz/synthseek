"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { trpc } from "@utils/trpc";
import { useAuthContext } from "@modules/providers/AuthProvider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentUser, isLoading } = useAuthContext();
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
