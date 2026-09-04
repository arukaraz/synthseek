import { trpc } from "@utils/trpc";

export function useDeviceHeartbeat() {
  return trpc.playback.heartbeat.useMutation();
}
