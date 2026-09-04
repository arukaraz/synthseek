import { trpc } from "@utils/trpc";

export function useForgetDevice() {
  return trpc.playback.forgetDevice.useMutation();
}
