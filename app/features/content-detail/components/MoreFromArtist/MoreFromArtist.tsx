"use client";

import { ContentCard } from "../ContentCard";
import { railCardSlot, railTrack, railWrap } from "../../styles";
import type { MoreFromArtistProps } from "./types";

export function MoreFromArtist({ albums, onSelectAlbum, trackRef }: MoreFromArtistProps) {
  return (
    <div className={railWrap()}>
      <div ref={trackRef} className={railTrack()}>
        {albums.map((album) => (
          <div key={album.id} className={railCardSlot()}>
            <ContentCard item={album} onSelect={onSelectAlbum} />
          </div>
        ))}
      </div>
    </div>
  );
}
