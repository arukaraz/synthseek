import { trpc } from "@utils/trpc";

export function useScrobbleHealth() {
  return trpc.analytics.pipeline.scrobbleHealth.useQuery();
}
