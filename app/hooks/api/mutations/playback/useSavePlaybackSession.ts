import { trpc } from "@utils/trpc";

export function useSavePlaybackSession() {
  return trpc.playback.saveSession.useMutation();
}
