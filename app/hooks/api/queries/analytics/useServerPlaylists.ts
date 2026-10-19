import { trpc } from "@utils/trpc";

export function useServerPlaylists() {
  return trpc.analytics.library.serverPlaylists.useQuery();
}
