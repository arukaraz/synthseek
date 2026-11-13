import type { ListeningNowUpdatePayload } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

export function handleListeningNowUpdate(
  event: ListeningNowUpdatePayload,
  utils: TrpcUtils,
  viewerId: string | null
): void {
  if (viewerId === null) {
    void utils.playback.listeningNow.invalidate();
    return;
  }
  utils.playback.listeningNow.setData(
    undefined,
    event.members.filter((member) => member.userId !== viewerId)
  );
}
