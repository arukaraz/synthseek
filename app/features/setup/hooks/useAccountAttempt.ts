"use client";

import { useEffect, useState } from "react";

import { useSetupBootstrap } from "@hooks/api/mutations/auth/useSetupBootstrap";

import { MS_PER_SECOND } from "../constants";
import { setupFailureOf } from "../helpers";
import type { AccountAttemptState, AccountDraft } from "../types";

export function useAccountAttempt(tokenRequired: boolean) {
  const mutation = useSetupBootstrap();
  const [state, setState] = useState<AccountAttemptState>({ kind: "idle" });

  useEffect(() => {
    if (state.kind !== "throttled") return;
    const timer = setTimeout(() => setState({ kind: "released" }), state.retryAfterSeconds * MS_PER_SECOND);
    return () => clearTimeout(timer);
  }, [state]);

  const submit = async ({ email, username, password, token }: AccountDraft) => {
    setState({ kind: "pending" });
    const account = { email: email.trim(), username: username.trim(), password };
    try {
      await mutation.mutateAsync(tokenRequired ? { ...account, setupToken: token.trim() } : account);
    } catch (error) {
      const failure = setupFailureOf(error);
      if (failure.kind === "throttled") {
        setState({
          kind: "throttled",
          retryAfterSeconds: failure.retryAfterSeconds,
          deadline: Date.now() + failure.retryAfterSeconds * MS_PER_SECOND,
        });
      } else {
        setState({ kind: "rejected", failure });
      }
    }
  };

  return { state, submit };
}
