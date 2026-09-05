import { trpc } from "@utils/trpc";

export function useListeningConnections() {
  return trpc.playback.scrobble.connections.useQuery();
}
