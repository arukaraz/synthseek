import { useCallback } from "react";

import type { PlexPinStart } from "@hooks/ui/types";
import { trpc } from "@utils/trpc";

interface PlexLinkResolved {
  plexUsername: string | null;
}

interface PlexLinkFlow {
  start: () => Promise<PlexPinStart>;
  poll: (pinId: string) => Promise<PlexLinkResolved | null>;
}

export function usePlexLinkFlow(): PlexLinkFlow {
  const startMutation = trpc.auth.linkPlexStart.useMutation();
  const completeMutation = trpc.auth.linkPlexComplete.useMutation();

  const start = useCallback(() => startMutation.mutateAsync(), [startMutation]);

  const poll = useCallback(
    async (pinId: string) => {
      const result = await completeMutation.mutateAsync({ pinId });
      if (result.status !== "linked" || !result.link) return null;
      return { plexUsername: result.link.plexUsername };
    },
    [completeMutation]
  );

  return { start, poll };
}
