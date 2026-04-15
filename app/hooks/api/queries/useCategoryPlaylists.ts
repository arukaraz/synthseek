import { trpc } from "@utils/trpc";

export function useCategoryPlaylists(categoryId: string, categoryName: string, limit = 10) {
  return trpc.music.getCategoryPlaylists.useQuery(
    { categoryId, categoryName, limit },
    {
      staleTime: 30 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      enabled: !!categoryId && !!categoryName,
    }
  );
}
