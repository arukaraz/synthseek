"use client";

import { ContentCard } from "../ContentCard";
import { cardGridRow } from "../../styles";
import type { DiscographyProps } from "./types";

export function Discography({ albums, onSelectAlbum }: DiscographyProps) {
  return (
    <div className={cardGridRow()}>
      {albums.map((album) => (
        <ContentCard key={album.id} item={album} onSelect={onSelectAlbum} />
      ))}
    </div>
  );
}
