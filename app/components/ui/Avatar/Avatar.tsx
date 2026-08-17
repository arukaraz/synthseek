"use client";

import { cn } from "@utils/cn";
import { useEffect, useState } from "react";

import { firstInitial } from "./helpers";
import {
  avatarFallbackGradient,
  avatarImage,
  avatarInitial,
  avatarInner,
  avatarRing,
  initialSizeClasses,
  innerSizeClasses,
  sizeClasses,
} from "./styles";
import type { AvatarProps } from "./types";

export function Avatar({ className, size = "md", imageUrl, username, children, ref, ...props }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const showImage = Boolean(imageUrl) && !imageFailed;
  const initial = firstInitial(username);
  const showInitial = !showImage && initial.length > 0;

  return (
    <div ref={ref} className={cn(avatarRing, sizeClasses[size], className)} {...props}>
      <div
        className={cn(
          avatarInner,
          innerSizeClasses[size],
          showInitial ? avatarFallbackGradient : showImage ? null : "bg-surface/80"
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl ?? ""} alt="" className={avatarImage} onError={() => setImageFailed(true)} />
        ) : showInitial ? (
          <span aria-hidden className={cn(avatarInitial, initialSizeClasses[size])}>
            {initial}
          </span>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
