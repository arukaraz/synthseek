import type { AppRouter } from "@api/__generated__/types";
import type { QueuePresence } from "@components/ui/QueueAddButton";
import type { inferRouterOutputs } from "@trpc/server";

type SuggestionsPage = inferRouterOutputs<AppRouter>["playlists"]["suggestions"];

export type SuggestedTrack = SuggestionsPage["tracks"][number];

export type SuggestedYears = SuggestionsPage["years"];

export interface KnownYears {
  playlistId: string;
  years: SuggestedYears;
}

export interface YearThumbs {
  low: number;
  high: number;
}

export interface YearSpan {
  floor: number;
  ceiling: number;
}

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

export interface SuggestedFiltersProps {
  years: SuggestedYears;
  saving: boolean;
  onApply: (years: SuggestedYears) => void;
}
