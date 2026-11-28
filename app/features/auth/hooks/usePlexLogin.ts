"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { usePlexLoginFlow } from "@hooks/api/mutations/auth/usePlexLoginFlow";
import type { PlexPinFailure } from "@hooks/ui/types";
import { usePlexPinPopup } from "@hooks/ui/usePlexPinPopup";
import { returnPathOf } from "@utils/returnPath";

import { plexFailureOf } from "../helpers";
import type { CallbackFailure } from "../types";

export function usePlexLogin() {
  const router = useRouter();
  const { start: startFlow, poll } = usePlexLoginFlow();
  const [failure, setFailure] = useState<CallbackFailure | null>(null);

  const popup = usePlexPinPopup({
    start: startFlow,
    poll,
    onResolved: () => {
      router.replace(returnPathOf(window.location.search));
    },
    onFailure: (pinFailure: PlexPinFailure) => {
      const outcome = plexFailureOf(pinFailure);
      if (outcome.kind === "needsSetup") {
        router.replace("/setup");
        return;
      }
      setFailure(outcome);
    },
  });

  const startLogin = () => {
    setFailure(null);
    void popup.start();
  };

  return { startLogin, phase: popup.phase, session: popup.session, isPending: popup.isPending, failure };
}
