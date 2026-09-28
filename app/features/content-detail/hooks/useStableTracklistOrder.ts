"use client";

import { useMemo, useState } from "react";

import { arrangeByOrder, sortedTrackIds, tracklistOrderSignature } from "../components/PlaylistDetailBody/helpers";
import type { SortDirection, TracklistSortKey } from "../components/PlaylistDetailBody/types";
import type { TracklistTrack } from "../components/Tracklist/types";

export function useStableTracklistOrder(
  tracks: TracklistTrack[],
  sortKey: TracklistSortKey,
  direction: SortDirection
): TracklistTrack[] {
  const signature = tracklistOrderSignature(tracks, sortKey, direction);
  const [frozen, setFrozen] = useState(() => ({ signature, ids: sortedTrackIds(tracks, sortKey, direction) }));
  const current =
    frozen.signature === signature ? frozen : { signature, ids: sortedTrackIds(tracks, sortKey, direction) };
  if (current !== frozen) setFrozen(current);

  return useMemo(() => arrangeByOrder(tracks, current.ids), [tracks, current.ids]);
}
