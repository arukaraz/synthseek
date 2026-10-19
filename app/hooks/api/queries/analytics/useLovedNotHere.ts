import { trpc } from "@utils/trpc";

export function useLovedNotHere() {
  return trpc.analytics.discover.loved.useQuery();
}
