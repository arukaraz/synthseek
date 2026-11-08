"use client";

import { artworkImage } from "@utils/artworkProxy";
import Image from "next/image";

import { cardInitials } from "./helpers";
import { cardImage, cardInitials as cardInitialsStyle } from "./styles";
import type { CardArtworkProps } from "./types";

export function CardArtwork({ src, name, sizes }: CardArtworkProps) {
  if (!src) {
    return (
      <span aria-hidden className={cardInitialsStyle()}>
        {cardInitials(name)}
      </span>
    );
  }
  return <Image {...artworkImage(src)} alt="" fill sizes={sizes} className={cardImage()} />;
}
