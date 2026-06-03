"use client";

import { useRouter } from "next/navigation";

import { usePlexLoginFlow } from "@hooks/api/mutations/auth/usePlexLoginFlow";
import { usePlexPinPopup } from "@hooks/ui/usePlexPinPopup";

export function usePlexLogin() {
  const router = useRouter();
  const { start: startFlow, poll } = usePlexLoginFlow();

  const popup = usePlexPinPopup({
    start: startFlow,
    poll,
    onResolved: () => {
      router.replace("/");
    },
  });

  return { startLogin: popup.start, phase: popup.phase, isPending: popup.isPending };
}
