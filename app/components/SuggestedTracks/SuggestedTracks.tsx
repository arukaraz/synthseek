"use client";

import { useAddSuggestedTrack } from "@hooks/api/mutations/playlists/useAddSuggestedTrack";
import { useHidePlaylistSuggestion } from "@hooks/api/mutations/playlists/useHidePlaylistSuggestion";
import { useSetPlaylistSuggestionYears } from "@hooks/api/mutations/playlists/useSetPlaylistSuggestionYears";
import { SUGGESTION_BARREN_PAGES } from "@hooks/api/queries/playlist-suggestions/constants";
import { readSuggestionPages } from "@hooks/api/queries/playlist-suggestions/helpers";
import { usePlaylistSuggestionGone } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionGone";
import { usePlaylistSuggestionSeed } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestionSeed";
import { usePlaylistSuggestions } from "@hooks/api/queries/playlist-suggestions/usePlaylistSuggestions";
import { playerActions, useQueuePresence } from "@hooks/ui/player";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SUGGESTED_ANY_YEAR, SUGGESTED_MORE_SKELETON_ROWS, SUGGESTED_SKELETON_ROWS } from "./constants";
import { filtersYears, knowsYears, libraryCopyId, yearsInForce, yearsLabel } from "./helpers";
import {
  suggestedHead,
  suggestedNote,
  suggestedRetry,
  suggestedRoot,
  suggestedScroll,
  suggestedSub,
  suggestedTitle,
  suggestedTitles,
  suggestedTool,
} from "./styles";
import { SuggestedFilters } from "./SuggestedFilters";
import { SuggestedSkeletonRow } from "./SuggestedSkeletonRow";
import { SuggestedTrackRow } from "./SuggestedTrackRow";
import type { KnownYears, SuggestedTrack, SuggestedTracksProps, SuggestedYears } from "./types";

export function SuggestedTracks({ playlistId }: SuggestedTracksProps) {
  const { t } = useTranslation("components");
  const { seed, reseed } = usePlaylistSuggestionSeed(playlistId);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [known, setKnown] = useState<KnownYears | null>(null);
  const query = usePlaylistSuggestions({ playlistId, seed });
  const { gone } = usePlaylistSuggestionGone({ playlistId, seed });
  const hide = useHidePlaylistSuggestion({ playlistId, seed });
  const saveYears = useSetPlaylistSuggestionYears(playlistId);
  const { add, pendingId } = useAddSuggestedTrack({ playlistId, seed });
  const { playEntity } = useEntityPlayback();
  const presenceOf = useQueuePresence();
  const { fetchNextPage } = query;

  const { rows } = useMemo(
    () => readSuggestionPages(query.data?.pages ?? [], SUGGESTION_BARREN_PAGES, gone),
    [gone, query.data?.pages]
  );
  const more = query.hasNextPage;
  const loadedYears = query.data?.pages[0]?.years;
  if (loadedYears !== undefined && !knowsYears(known, playlistId, loadedYears)) {
    setKnown({ playlistId, years: loadedYears });
  }
  const years = yearsInForce(loadedYears, known, playlistId, SUGGESTED_ANY_YEAR);
  const filtered = filtersYears(years);

  const sentinelRef = useInfiniteScroll({
    root: scroller,
    hasNextPage: more && !query.isFetchNextPageError,
    isFetchingNextPage: query.isFetchingNextPage,
    onLoadMore: () => void fetchNextPage(),
  });

  const refresh = useCallback(() => {
    if (scroller) scroller.scrollTop = 0;
    reseed();
  }, [reseed, scroller]);

  const applyYears = useCallback(
    (next: SuggestedYears) => {
      saveYears.mutate(
        { playlistId, from: next.from, to: next.to },
        {
          onSuccess: () => {
            setKnown({ playlistId, years: next });
            if (scroller) scroller.scrollTop = 0;
          },
        }
      );
    },
    [playlistId, saveYears, scroller]
  );

  const handleHide = useCallback(
    (track: SuggestedTrack) => hide.mutate({ playlistId, externalId: track.externalId }),
    [hide, playlistId]
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

  return (
    <section className={suggestedRoot()} aria-label={t("suggestedTracks.title")}>
      <div className={suggestedHead()}>
        <div className={suggestedTitles()}>
          <h3 className={suggestedTitle()}>{t("suggestedTracks.title")}</h3>
          <span className={suggestedSub({ filtered })}>
            {filtered ? yearsLabel(years, t) : t("suggestedTracks.basis")}
          </span>
        </div>
        <SuggestedFilters years={years} saving={saveYears.isPending} onApply={applyYears} />
        <button
          type="button"
          className={suggestedTool()}
          onClick={refresh}
          disabled={query.isFetching}
          title={refreshLabel}
          aria-label={refreshLabel}
        >
          <RefreshCw className="size-4" aria-hidden />
        </button>
      </div>

      <div className={suggestedScroll()} ref={setScroller}>
        {query.isLoading ? (
          SUGGESTED_SKELETON_ROWS.map((row) => <SuggestedSkeletonRow key={row} />)
        ) : query.isError && query.data === undefined ? (
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
                    onAdd={() => void add(track)}
                  />
                );
              })}
            </ul>
            {query.isFetchNextPageError ? (
              <div className={suggestedNote()} role="alert">
                {t("suggestedTracks.moreFailed")}
                <button type="button" className={suggestedRetry()} onClick={() => void fetchNextPage()}>
                  {t("suggestedTracks.retry")}
                </button>
              </div>
            ) : more ? (
              <div ref={sentinelRef} aria-hidden>
                {SUGGESTED_MORE_SKELETON_ROWS.map((row) => (
                  <SuggestedSkeletonRow key={row} />
                ))}
              </div>
            ) : (
              <p className={suggestedNote()}>
                {t(
                  rows.length > 0
                    ? "suggestedTracks.end"
                    : filtered
                      ? "suggestedTracks.emptyFiltered"
                      : "suggestedTracks.empty"
                )}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
