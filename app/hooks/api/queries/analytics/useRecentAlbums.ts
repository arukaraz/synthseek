import { trpc } from "@utils/trpc";

export function useRecentAlbums() {
  return trpc.analytics.library.recentAlbums.useQuery();
}
