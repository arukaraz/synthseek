"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { returnPathOf } from "@utils/returnPath";

import { signInFailureOf } from "../helpers";
import type { LoginAttemptState, SignInAttemptOptions } from "../types";
import { useAuthTransition } from "./useAuthTransition";

const MS_PER_SECOND = 1000;

export function useLoginAttempt<Credentials>({ run, invalidCredentialsTitle }: SignInAttemptOptions<Credentials>) {
  const router = useRouter();
  const { markNavigating } = useAuthTransition();
  const [state, setState] = useState<LoginAttemptState>({ kind: "idle" });

  useEffect(() => {
    if (state.kind !== "throttled") return;
    const timer = setTimeout(() => setState({ kind: "released" }), state.retryAfterSeconds * MS_PER_SECOND);
    return () => clearTimeout(timer);
  }, [state]);

  const submit = async (credentials: Credentials) => {
    setState({ kind: "pending" });
    try {
      await run(credentials);
      markNavigating();
      router.replace(returnPathOf(window.location.search));
    } catch (error) {
      const failure = signInFailureOf(error, invalidCredentialsTitle);
      if (failure.kind === "throttled") {
        setState({
          kind: "throttled",
          retryAfterSeconds: failure.retryAfterSeconds,
          deadline: Date.now() + failure.retryAfterSeconds * MS_PER_SECOND,
        });
      } else if (failure.kind === "needsSetup") {
        router.replace("/setup");
      } else if (failure.kind === "pendingApproval") {
        setState({ kind: "pendingApproval" });
      } else {
        setState({ kind: "rejected", message: failure });
      }
    }
  };

  return { state, submit };
}
