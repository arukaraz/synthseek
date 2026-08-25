import { trpc } from "@utils/trpc";

export function useSubsonicStatus() {
  return trpc.subsonic.status.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
