"use client";

import Image from "next/image";

import { artworkProxySrc } from "@utils/artworkProxy";

import { detailInitials } from "../../helpers";
import {
  railTrack,
  railWrap,
  similarAvatar,
  similarCard,
  similarImage,
  similarInitials,
  similarName,
} from "../../styles";
import type { SimilarArtistsProps } from "./types";

export function SimilarArtists({ artists, onSelect, trackRef }: SimilarArtistsProps) {
  return (
    <div className={railWrap()}>
      <div ref={trackRef} className={railTrack()}>
        {artists.map((artist) => {
          const content = (
            <>
              <div className={similarAvatar()}>
                {artist.image ? (
                  <Image src={artworkProxySrc(artist.image)} alt="" fill sizes="96px" className={similarImage()} />
                ) : (
                  <span aria-hidden className={similarInitials()}>
                    {detailInitials(artist.name)}
                  </span>
                )}
              </div>
              <span className={similarName()}>{artist.name}</span>
            </>
          );

          if (artist.deezerArtistId) {
            return (
              <button key={artist.name} type="button" className={similarCard()} onClick={() => onSelect(artist)}>
                {content}
              </button>
            );
          }

          return (
            <div key={artist.name} className={similarCard()}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
