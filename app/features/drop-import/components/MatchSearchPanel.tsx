"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ContentType } from "@api/__generated__/types";
import { Button } from "@components/ui/Button";
import { Spinner } from "@components/ui/Spinner";
import { useMatchDropImportFile, useSearchContent } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { artworkProxySrc } from "@utils/artworkProxy";
import { formatTrackDuration } from "@utils/formatters";

import { MATCH_SEARCH_LIMIT } from "../constants";
import { defaultMatchQuery } from "../helpers";
import {
  matchPanel,
  matchResultList,
  matchResultRow,
  matchSearchInput,
  mutedText,
  trackArtist,
  trackInfo,
  trackMeta,
  trackThumb,
  trackThumbFallback,
  trackTitle,
} from "../styles";
import type { MatchSearchPanelProps } from "../types";

export function MatchSearchPanel({ file, onClose }: MatchSearchPanelProps) {
  const { t } = useTranslation("library");
  const [query, setQuery] = useState(() => defaultMatchQuery(file));
  const debounced = useDebounce(query);
  const search = useSearchContent(debounced, [ContentType.enum.track], { limit: MATCH_SEARCH_LIMIT });
  const match = useMatchDropImportFile();

  const tracks = search.data?.results.tracks?.items ?? [];

  return (
    <div className={matchPanel()}>
      <div className="flex items-center gap-2">
        <input
          className={matchSearchInput()}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("dropImport.match.searchPlaceholder")}
          aria-label={t("dropImport.match.searchPlaceholder")}
        />
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t("dropImport.match.close")}
        </Button>
      </div>

      {search.isLoading && debounced.trim().length > 0 ? (
        <div className="flex justify-center py-3">
          <Spinner size="sm" />
        </div>
      ) : search.isError ? (
        <span className={mutedText()}>{t("dropImport.match.searchError")}</span>
      ) : tracks.length === 0 ? (
        <span className={mutedText()}>{t("dropImport.match.noResults")}</span>
      ) : (
        <ul className={matchResultList()}>
          {tracks.map((track) => {
            const image = track.album.images[0]?.url ?? track.images[0]?.url ?? null;
            return (
              <li key={track.id} className={matchResultRow()}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={artworkProxySrc(image)} alt="" loading="lazy" className={trackThumb()} />
                ) : (
                  <div className={trackThumbFallback()} aria-hidden="true" />
                )}
                <div className={trackInfo()}>
                  <span className={trackTitle()}>{track.title}</span>
                  <span className={trackArtist()}>{track.artist}</span>
                </div>
                <span className={trackMeta()}>{formatTrackDuration(track.duration_ms)}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={match.isPending}
                  onClick={() => match.mutate({ fileId: file.id, externalId: track.id }, { onSuccess: onClose })}
                >
                  {t("dropImport.match.pick")}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
