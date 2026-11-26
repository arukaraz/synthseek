"use client";

import Image from "next/image";
import { useState } from "react";

import { HighlightGallery } from "./HighlightGallery";
import { HighlightVideo } from "./HighlightVideo";
import { VisualPlaceholder } from "./VisualPlaceholder";
import { MEDIA_FRAME } from "./constants";
import { mediaUrl } from "./helpers";
import { mediaFrame } from "./styles";
import type { HighlightMediaProps } from "./types";

export function HighlightMedia({ media, mediaPath }: HighlightMediaProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <VisualPlaceholder />;

  if (media.type === "gallery") {
    return <HighlightGallery slides={media.slides} mediaPath={mediaPath} onError={() => setFailed(true)} />;
  }

  if (media.type === "image") {
    return (
      <Image
        src={mediaUrl(mediaPath, media.file)}
        alt={media.alt}
        width={MEDIA_FRAME.WIDTH}
        height={MEDIA_FRAME.HEIGHT}
        unoptimized
        className={mediaFrame()}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <HighlightVideo
      src={mediaUrl(mediaPath, media.file)}
      poster={media.poster ? mediaUrl(mediaPath, media.poster) : undefined}
      alt={media.alt}
      onError={() => setFailed(true)}
    />
  );
}
