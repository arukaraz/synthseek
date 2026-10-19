import { trpc } from "@utils/trpc";

export function useRepeatRewind() {
  return trpc.analytics.listening.rewind.useQuery();
}
