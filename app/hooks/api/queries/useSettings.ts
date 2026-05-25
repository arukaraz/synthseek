import { trpc } from "@utils/trpc";

export function useSettings() {
  return trpc.settings.get.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
