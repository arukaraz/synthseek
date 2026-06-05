import { trpc } from "@utils/trpc";

export function useUpdateCheck() {
  return trpc.updates.check.useQuery(undefined, {
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
