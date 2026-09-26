import { trpc } from "@utils/trpc";

export function usePlaylistSyncTargets() {
  return trpc.requests.playlistSyncTargets.useQuery();
}
