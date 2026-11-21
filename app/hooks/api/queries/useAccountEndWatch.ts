import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useEffect, useRef } from "react";

import { trpc } from "@utils/trpc";

export function useAccountEndWatch(account: string | null, settled: boolean): void {
  const queryClient = useQueryClient();
  const seen = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!settled) return;
    const previous = seen.current;
    seen.current = account;
    if (previous === account || previous === null) return;
    const ended = previous !== undefined;
    if (!ended && account !== null) return;
    const identity = new Set(queryClient.getQueryCache().findAll({ queryKey: getQueryKey(trpc.auth.me) }));
    void queryClient.resetQueries({
      predicate: (query) => !identity.has(query) && (ended || !query.isActive()),
    });
  }, [queryClient, account, settled]);
}
