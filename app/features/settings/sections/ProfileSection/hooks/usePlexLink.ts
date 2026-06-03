"use client";

import { toast } from "sonner";

import { usePlexLinkFlow } from "@hooks/api/mutations/auth/usePlexLinkFlow";
import { usePlexPinPopup } from "@hooks/ui/usePlexPinPopup";
import { trpc } from "@utils/trpc";

export function usePlexLink() {
  const utils = trpc.useUtils();
  const { start: startFlow, poll } = usePlexLinkFlow();

  return usePlexPinPopup({
    start: startFlow,
    poll,
    onResolved: async (resolved) => {
      await utils.auth.me.invalidate();
      toast.success(resolved.plexUsername ? `Plex linked as ${resolved.plexUsername}` : "Plex account linked");
    },
    timeoutMessage: "Plex linking timed out",
    errorFallbackMessage: "Failed to link Plex",
  });
}
