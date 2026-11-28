"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useOidcStart } from "@hooks/api/mutations/auth/useOidcFlow";
import { returnPathOf } from "@utils/returnPath";

import { startFailureOf } from "../helpers";
import type { CallbackFailure, OidcSignInPhase } from "../types";

export function useOidcSignIn(wantsRedirect: boolean, ready: boolean) {
  const { mutate, isPending, isSuccess } = useOidcStart();
  const [failure, setFailure] = useState<CallbackFailure | null>(null);
  const [autoStart, setAutoStart] = useState<boolean | null>(null);
  const started = useRef(false);

  if (ready && autoStart === null) setAutoStart(wantsRedirect);

  const begin = useCallback(() => {
    started.current = true;
    setFailure(null);
    mutate(
      { returnTo: returnPathOf(window.location.search) },
      { onError: (error) => setFailure(startFailureOf(error)) }
    );
  }, [mutate]);

  useEffect(() => {
    if (autoStart !== true || started.current) return;
    begin();
  }, [autoStart, begin]);

  const phase: OidcSignInPhase = isPending || isSuccess ? "pending" : failure !== null ? "error" : "idle";
  const redirecting = autoStart === true && failure === null;

  return { begin, phase, failure, redirecting };
}
