"use client";

import { useState } from "react";
import Image from "next/image";
import { Music } from "lucide-react";
import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { circularImagePlaceholder } from "../styles";
import { cn } from "@utils/cn";
import { artworkProxySrc } from "@utils/artworkProxy";
import { FallbackIcon } from "./FallbackIcon";
import type { ImageWithFallbackProps } from "./types";

export function ImageWithFallback({
  src,
  alt,
  fallbackIcon = Music,
  className,
  containerClassName,
  priority = false,
  fill,
  sizes,
  width,
  height,
  placeholderSize = "md",
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    if (fill) {
      return (
        <div className={cn(circularImagePlaceholder(), containerClassName)}>
          <FallbackIcon Icon={fallbackIcon} size="fill" />
        </div>
      );
    }

    return <ImagePlaceholder size={placeholderSize} icon={fallbackIcon} className={className} />;
  }

  const resolvedSrc = artworkProxySrc(src);

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
        onError={() => setError(true)}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
