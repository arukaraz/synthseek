import { trpc } from "@utils/trpc";

export function useRecordPlay() {
  return trpc.playback.recordPlay.useMutation();
}
