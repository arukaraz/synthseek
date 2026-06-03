import { useCallback } from "react";

import type { PublicUser } from "@api/__generated__/types";
import type { PlexPinStart } from "@hooks/ui/types";
import { trpc } from "@utils/trpc";

interface PlexLoginFlow {
  start: () => Promise<PlexPinStart>;
  poll: (pinId: string) => Promise<PublicUser | null>;
}

export function usePlexLoginFlow(): PlexLoginFlow {
  const utils = trpc.useUtils();
  const startMutation = trpc.auth.plexStart.useMutation();
  const completeMutation = trpc.auth.plexComplete.useMutation();

  const start = useCallback(() => startMutation.mutateAsync(), [startMutation]);

  const poll = useCallback(
    async (pinId: string) => {
      const result = await completeMutation.mutateAsync({ pinId });
      if (result.status !== "authenticated" || !result.user) return null;
      utils.auth.me.setData(undefined, result.user);
      return result.user;
    },
    [completeMutation, utils.auth.me]
  );

  return { start, poll };
}
