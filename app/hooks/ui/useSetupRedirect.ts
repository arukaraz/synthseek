"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSetupRequired } from "@hooks/api/queries/useSetupRequired";
import { useAuthContext } from "@modules/providers/AuthProvider";

import type { SetupGate, SetupRedirectContext } from "./types";

export function useSetupRedirect(context: SetupRedirectContext): SetupGate {
  const router = useRouter();
  const { currentUser, isLoading: isAuthLoading } = useAuthContext();
  const setupQuery = useSetupRequired();

  const isResolving =
    setupQuery.isLoading ||
    (context !== "login" && isAuthLoading) ||
    (setupQuery.data === undefined && !setupQuery.isError);

  const setupRequired = setupQuery.data === true;

  const shouldHold = isResolving || setupQuery.isError;

  useEffect(() => {
    if (shouldHold) return;

    if (context === "app") {
      if (setupRequired) {
        router.replace("/setup");
        return;
      }
      if (!currentUser) router.replace("/login");
      return;
    }

    if (context === "login") {
      if (setupRequired) {
        router.replace("/setup");
        return;
      }
      if (currentUser) router.replace("/");
      return;
    }

    if (!setupRequired) router.replace("/");
  }, [context, currentUser, shouldHold, router, setupRequired]);

  if (isResolving) return { status: "resolving" };
  if (setupQuery.isError) return { status: "error" };

  if (context === "app") {
    if (setupRequired) return { status: "redirecting" };
    if (!currentUser) return { status: "redirecting" };
    return { status: "ready" };
  }

  if (context === "login") {
    if (setupRequired || currentUser) return { status: "redirecting" };
    return { status: "ready" };
  }

  if (!setupRequired) return { status: "redirecting" };
  return { status: "ready" };
}
