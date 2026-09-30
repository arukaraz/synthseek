import { trpc } from "@utils/trpc";

export function useSavePlaybackPosition() {
  return trpc.playback.savePosition.useMutation();
}
