import { trpc } from "@utils/trpc";

export function useCurrentVersion() {
  return trpc.updates.current.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
}
