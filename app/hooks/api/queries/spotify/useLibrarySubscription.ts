import { trpc } from "@utils/trpc";

export function useLibrarySubscription() {
  return trpc.librarySource.subscription.get.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
}
