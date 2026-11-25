import type { ListenedTracks } from "@hooks/api/queries/analytics/types";

export type EmptyReason = "error" | "inactive" | "unlinked" | "no-data";

export interface EmptyReasonInput {
  isError: boolean;
  data: ListenedTracks | undefined;
  empty: boolean;
}
