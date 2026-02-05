"use client";

import { useState } from "react";
import Image from "next/image";
import { type LucideIcon, Music } from "lucide-react";
import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { circularImagePlaceholder, responsiveFallbackIcon } from "../styles";
import { cn } from "@utils/cn";

type ImagePlaceholderSize = "sm" | "md" | "lg";

interface BaseImageWithFallbackProps {
  src?: string | null;
  alt: string;
  fallbackIcon?: LucideIcon;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

interface FillModeProps extends BaseImageWithFallbackProps {
  fill: true;
  sizes: string;
  width?: never;
  height?: never;
  placeholderSize?: never;
}

interface FixedSizeProps extends BaseImageWithFallbackProps {
  fill?: false;
  width: number;
  height: number;
  sizes?: string;
  placeholderSize?: ImagePlaceholderSize;
}

type ImageWithFallbackProps = FillModeProps | FixedSizeProps;

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

  if (fill) {
    return (
      <Image
        src={src}
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
      src={src}
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

function FallbackIcon({ Icon, size }: { Icon: LucideIcon; size: "fill" }) {
  if (size === "fill") {
    return <Icon className={responsiveFallbackIcon({ size: "fill" })} />;
  }
  return <Icon className="text-primary-400 h-8 w-8" />;
}
