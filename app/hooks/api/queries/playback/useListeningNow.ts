import { trpc } from "@utils/trpc";

export function useListeningNow() {
  return trpc.playback.listeningNow.useQuery();
}
