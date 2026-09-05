import type { UserActivityPayload, UserActivitySubject } from "@api/__generated__/types";
import type { trpc } from "@utils/trpc";

type TrpcUtils = ReturnType<typeof trpc.useUtils>;

const REDRAW: Record<UserActivitySubject, (utils: TrpcUtils) => void> = {
  favorites: (utils) => {
    utils.playback.favoriteTrackIds.invalidate();
    utils.library.getTracks.invalidate();
  },
  listeningServices: (utils) => {
    utils.playback.scrobble.connections.invalidate();
  },
};

export function handleUserActivity(event: UserActivityPayload, utils: TrpcUtils): void {
  REDRAW[event.subject](utils);
}
