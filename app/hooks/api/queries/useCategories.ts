import { trpc } from "@utils/trpc";

export function useCategories(limit = 16, locale?: string) {
  return trpc.spotify.getCategories.useQuery(
    { limit, locale },
    {
      staleTime: 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
    }
  );
}
