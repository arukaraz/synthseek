import { trpc } from "@utils/trpc";

export function useOnRepeat() {
  return trpc.analytics.listening.onRepeat.useQuery();
}
