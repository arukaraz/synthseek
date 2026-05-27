"use client";

import { useState } from "react";

import { useSpotifyTopArtists, useSpotifyTopTracks } from "@hooks/api/queries/spotify/useSpotifyTop";

import { TOP_RANGES } from "../../../constants";
import {
  emptyState,
  helperText,
  itemImage,
  itemSubtitle,
  itemTitle,
  list,
  listItem,
  tabButton,
  tabsRow,
} from "../../../styles";
import type { TopRange } from "../../../types";

export function TopReadOnlyTab() {
  const [range, setRange] = useState<TopRange>("medium_term");
  const tracks = useSpotifyTopTracks(range);
  const artists = useSpotifyTopArtists(range);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className={tabsRow()}>
        {TOP_RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={tabButton({ active: range === r.key })}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <p className={helperText() + " px-4 pt-2"}>
        Display-only. These items are not imported as requests.
      </p>
      <div className={list()}>
        <h3 className="text-fg/70 text-xs font-medium uppercase tracking-wider">Top artists</h3>
        {artists.isLoading ? (
          <div className={emptyState()}>Loading…</div>
        ) : (
          artists.data?.map((artist) => (
            <div key={artist.id} className={listItem()}>
              {artist.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artist.image} alt="" className={itemImage()} />
              ) : (
                <div className={itemImage()} />
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={itemTitle()}>{artist.name}</span>
                <span className={itemSubtitle()}>{artist.genres.slice(0, 3).join(", ") || "—"}</span>
              </div>
            </div>
          ))
        )}

        <h3 className="text-fg/70 mt-4 text-xs font-medium uppercase tracking-wider">Top tracks</h3>
        {tracks.isLoading ? (
          <div className={emptyState()}>Loading…</div>
        ) : (
          tracks.data?.map((track) => (
            <div key={track.id} className={listItem()}>
              {track.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.image} alt="" className={itemImage()} />
              ) : (
                <div className={itemImage()} />
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className={itemTitle()}>{track.title}</span>
                <span className={itemSubtitle()}>
                  {track.artist} • {track.album}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
