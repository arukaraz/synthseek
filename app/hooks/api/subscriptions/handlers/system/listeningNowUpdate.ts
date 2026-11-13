import type { trpc } from "@utils/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

export function handleListeningNowUpdate(utils: TrpcUtils): void {
  void utils.playback.listeningNow.invalidate();
}
