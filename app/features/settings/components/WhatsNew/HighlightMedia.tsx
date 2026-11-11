"use client";

import Image from "next/image";
import { useState } from "react";

import { REDUCED_MOTION_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { VisualPlaceholder } from "./VisualPlaceholder";
import { MEDIA_FRAME } from "./constants";
import { mediaUrl } from "./helpers";
import { mediaFrame } from "./styles";
import type { HighlightMediaProps } from "./types";

export function HighlightMedia({ media, mediaPath }: HighlightMediaProps) {
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [failed, setFailed] = useState(false);

  if (failed) return <VisualPlaceholder />;

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
    <video
      src={mediaUrl(mediaPath, media.file)}
      poster={media.poster ? mediaUrl(mediaPath, media.poster) : undefined}
      aria-label={media.alt}
      className={mediaFrame()}
      muted
      loop
      playsInline
      autoPlay={!reducedMotion}
      controls={reducedMotion}
      preload="metadata"
      onError={() => setFailed(true)}
    />
  );
}
