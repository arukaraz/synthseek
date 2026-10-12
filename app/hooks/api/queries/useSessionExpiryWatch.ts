import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { trpc } from "@utils/trpc";
import { isUnauthorizedError } from "@utils/trpc-error";

export function useSessionExpiryWatch(): void {
  const queryClient = useQueryClient();
  const utils = trpc.useUtils();

  useEffect(() => {
    const recheckSession = (error: unknown): void => {
      if (isUnauthorizedError(error)) void utils.auth.me.invalidate();
    };
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") recheckSession(event.action.error);
    });
    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.action.type === "error") recheckSession(event.action.error);
    });
    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient, utils]);
}
