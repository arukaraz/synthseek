import { trpc } from "@utils/trpc";

export function usePublishPlaybackState() {
  return trpc.playback.publishState.useMutation();
}
