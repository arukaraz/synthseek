"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useSetupRequired } from "@hooks/api/queries/useSetupRequired";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { HOME_PATH, loginHrefFor, loginHrefToSetup, returnPathOf, SETUP_PATH } from "@utils/returnPath";

import { setupTargetOf } from "./helpers";
import type { SetupGate, SetupRedirectContext, SetupTarget } from "./types";

function hrefOf(target: Exclude<SetupTarget, "stay">): string {
  switch (target) {
    case "home":
      return HOME_PATH;
    case "setup":
      return SETUP_PATH;
    case "loginToSetup":
      return loginHrefToSetup();
    case "loginBack":
      return loginHrefFor(window.location);
    case "returnPath":
      return returnPathOf(window.location.search);
  }
}

export function useSetupRedirect(context: SetupRedirectContext): SetupGate {
  const router = useRouter();
  const {
    currentUser,
    isAdmin,
    isLoading: isAuthLoading,
    isError: isAuthError,
    refetch: refetchAuth,
  } = useAuthContext();
  const setupQuery = useSetupRequired();

  const isResolving =
    setupQuery.isLoading ||
    (context !== "login" && isAuthLoading) ||
    (setupQuery.data === undefined && !setupQuery.isError);

  const isBootstrapError = setupQuery.isError || (context === "app" && isAuthError);

  const shouldHold = isResolving || isBootstrapError;

  const retry = useCallback(() => {
    void setupQuery.refetch();
    refetchAuth();
  }, [setupQuery, refetchAuth]);

  const target = setupTargetOf({
    context,
    setupRequired: setupQuery.data?.required === true,
    tokenRequired: setupQuery.data?.tokenRequired === true,
    signedIn: Boolean(currentUser),
    isAdmin: isAdmin === true,
  });

  useEffect(() => {
    if (shouldHold || target === "stay") return;
    router.replace(hrefOf(target));
  }, [shouldHold, target, router]);

  if (isResolving) return { status: "resolving" };
  if (isBootstrapError) return { status: "error", retry };
  return target === "stay" ? { status: "ready" } : { status: "redirecting" };
}
