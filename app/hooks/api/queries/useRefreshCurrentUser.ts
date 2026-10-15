import { useCallback } from "react";

import { trpc } from "@utils/trpc";

export function useRefreshCurrentUser(): () => void {
  const utils = trpc.useUtils();
  return useCallback(() => void utils.auth.me.invalidate(), [utils]);
}
