import { trpc } from "@utils/trpc";

export function useJumpBackIn() {
  return trpc.analytics.listening.jumpBackIn.useQuery();
}
