import { trpc } from "@utils/trpc";

export function useApiKeys() {
  return trpc.apiKeys.list.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
