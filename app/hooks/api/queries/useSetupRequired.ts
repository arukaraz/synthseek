import { trpc } from "@utils/trpc";

export function useSetupRequired() {
  return trpc.auth.setupRequired.useQuery(undefined, {
    staleTime: 60 * 1000,
  });
}
