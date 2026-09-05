import { trpc } from "@utils/trpc";

export function useSeenPlaybackClients() {
  return trpc.playback.scrobble.seenClients.useQuery();
}
