import type { AppRouter } from "@api/__generated__/types";
import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { inferRouterOutputs } from "@trpc/server";

export type SuggestedTrack = inferRouterOutputs<AppRouter>["playlists"]["suggestions"]["tracks"][number];

export interface SuggestedTracksProps {
  playlistId: string;
}

export interface SuggestedTrackRowProps {
  track: SuggestedTrack;
  slot: number;
  presence: QueuePresence;
  adding: boolean;
  onPlay: () => void;
  onHide: () => void;
  onAdd: () => void;
}
