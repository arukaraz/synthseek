"use client";

import { useAddSuggestedTrack } from "@hooks/api/mutations/playlists/useAddSuggestedTrack";
import { useHidePlaylistSuggestion } from "@hooks/api/mutations/playlists/useHidePlaylistSuggestion";
import { usePlaylistSuggestions } from "@hooks/api/queries/usePlaylistSuggestions";
import { playerActions, useQueuePresence } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SUGGESTED_PAGE_SIZE, SUGGESTED_SKELETON_ROWS } from "./constants";
import { libraryCopyId, newSuggestionSeed, visibleSuggestions } from "./helpers";
import {
  suggestedHead,
  suggestedNote,
  suggestedRefresh,
  suggestedRetry,
  suggestedRoot,
  suggestedScroll,
  suggestedSkeleton,
  suggestedSkeletonBlock,
  suggestedSub,
  suggestedTitle,
  suggestedTitles,
} from "./styles";
import { SuggestedTrackRow } from "./SuggestedTrackRow";
import type { SuggestedTrack, SuggestedTracksProps } from "./types";

export function SuggestedTracks({ playlistId }: SuggestedTracksProps) {
  const { t } = useTranslation("components");
  const [seed, setSeed] = useState(() => newSuggestionSeed());
  const [shown, setShown] = useState(SUGGESTED_PAGE_SIZE);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const query = usePlaylistSuggestions({ playlistId, seed });
  const hide = useHidePlaylistSuggestion();
  const { add, pendingId } = useAddSuggestedTrack(playlistId);
  const { playEntity } = useEntityPlayback();
  const presenceOf = useQueuePresence();

  const { rows, more, total } = useMemo(
    () => visibleSuggestions(query.data?.tracks ?? [], hidden, shown),
    [query.data?.tracks, hidden, shown]
  );

  const sentinelRef = useInfiniteScroll({
    root: scroller,
    hasNextPage: more,
    isFetchingNextPage: false,
    onLoadMore: () => setShown((count) => count + SUGGESTED_PAGE_SIZE),
  });

  const refresh = useCallback(() => {
    setShown(SUGGESTED_PAGE_SIZE);
    setSeed(newSuggestionSeed());
  }, []);

  const leaveOut = useCallback((externalId: string) => {
    setHidden((current) => new Set(current).add(externalId));
  }, []);

  const handleHide = useCallback(
    (track: SuggestedTrack) => {
      leaveOut(track.externalId);
      hide.mutate({ playlistId, externalId: track.externalId });
    },
    [hide, leaveOut, playlistId]
  );

  const handleAdd = useCallback(
    async (track: SuggestedTrack) => {
      if (await add(track)) leaveOut(track.externalId);
    },
    [add, leaveOut]
  );

  const handlePlay = useCallback(
    (track: SuggestedTrack) => {
      const id = libraryCopyId(track);
      if (id === null) return;
      const presence = presenceOf(id);
      if (presence === "playing" || presence === "paused") {
        playerActions.togglePlay();
        return;
      }
      void playEntity({ kind: "tracks", trackIds: [id] });
    },
    [playEntity, presenceOf]
  );

  const refreshLabel = t("suggestedTracks.refresh");
  const loading = query.isLoading || (query.isFetching && query.isPlaceholderData);

  return (
    <section className={suggestedRoot()} aria-label={t("suggestedTracks.title")}>
      <div className={suggestedHead()}>
        <div className={suggestedTitles()}>
          <h3 className={suggestedTitle()}>{t("suggestedTracks.title")}</h3>
          <span className={suggestedSub()}>{t("suggestedTracks.basis")}</span>
        </div>
        <button
          type="button"
          className={suggestedRefresh()}
          onClick={refresh}
          disabled={query.isFetching}
          title={refreshLabel}
          aria-label={refreshLabel}
        >
          <RefreshCw className="size-4" aria-hidden />
        </button>
      </div>

      <div className={suggestedScroll()} ref={setScroller}>
        {loading ? (
          SUGGESTED_SKELETON_ROWS.map((row) => (
            <div key={row} className={suggestedSkeleton()} aria-hidden>
              <span className={suggestedSkeletonBlock({ shape: "disc" })} />
              <span className={suggestedSkeletonBlock({ shape: "cover" })} />
              <span className={suggestedSkeletonBlock({ shape: "line" })} />
              <span className={suggestedSkeletonBlock({ shape: "pill" })} />
            </div>
          ))
        ) : query.isError ? (
          <div className={suggestedNote()} role="alert">
            {t("suggestedTracks.failed")}
            <button type="button" className={suggestedRetry()} onClick={() => void query.refetch()}>
              {t("suggestedTracks.retry")}
            </button>
          </div>
        ) : (
          <>
            <ul>
              {rows.map((track, slot) => {
                const id = libraryCopyId(track);
                return (
                  <SuggestedTrackRow
                    key={track.externalId}
                    track={track}
                    slot={slot}
                    presence={id === null ? "absent" : presenceOf(id)}
                    adding={pendingId === track.externalId}
                    onPlay={() => handlePlay(track)}
                    onHide={() => handleHide(track)}
                    onAdd={() => void handleAdd(track)}
                  />
                );
              })}
            </ul>
            {more ? (
              <div ref={sentinelRef} aria-hidden />
            ) : (
              <p className={suggestedNote()}>{t(total > 0 ? "suggestedTracks.end" : "suggestedTracks.empty")}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
