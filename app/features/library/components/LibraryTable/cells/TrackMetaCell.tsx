"use client";

import { metaArtist, metaAlbum, metaDot, metaRow } from "../styles";
import type { TrackMetaCellProps } from "./types";

export function TrackMetaCell({ artist, albumName }: TrackMetaCellProps) {
  return (
    <div className={metaRow()}>
      <span className={metaArtist()}>{artist}</span>
      {albumName ? (
        <>
          <span className={metaDot()} aria-hidden />
          <span className={metaAlbum()}>{albumName}</span>
        </>
      ) : null}
    </div>
  );
}
