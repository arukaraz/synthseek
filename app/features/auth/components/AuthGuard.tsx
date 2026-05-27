"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useSetupRequired } from "@hooks/api/queries/useSetupRequired";
import { useAuthContext } from "@modules/providers/AuthProvider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentUser, isLoading } = useAuthContext();
  const setupQuery = useSetupRequired();

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
