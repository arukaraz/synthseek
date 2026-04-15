import { trpc } from "@utils/trpc";

export function useCategories(limit = 30) {
  return trpc.music.getCategories.useQuery(
    { limit },
    {
      staleTime: 60 * 60 * 1000,
      gcTime: 2 * 60 * 60 * 1000,
    }
  );
}
