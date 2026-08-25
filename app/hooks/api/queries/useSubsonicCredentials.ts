import { trpc } from "@utils/trpc";

export function useSubsonicCredentials() {
  return trpc.subsonic.listCredentials.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
