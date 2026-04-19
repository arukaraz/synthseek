"use client";

import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { ImageGlow } from "@components/ui/ImageGlow/ImageGlow";
import { StatusBadge } from "@components/ui/StatusBadge";
import { ContentType, type RequestStatus } from "@api/__generated__/types";
import { type LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@utils/cn";
import { getContentTypeColor, getContentTypeIcon, getContentTypeLabel } from "@utils/content-type-helpers";
import { musicBadge } from "../../styles";

type CardSize = "sm" | "md";

interface CardHeaderProps {
  imageUrl?: string | null;
  title: string;
  subtitle: string;
  status: RequestStatus;
  icon?: LucideIcon;
  size?: CardSize;
  showGlow?: boolean;
  showMusicBadge?: boolean;
  contentType?: ContentType;
  dataCyPrefix?: string;
}

const sizeConfig = {
  sm: {
    container: "h-14 w-14",
    image: { width: 56, height: 56 },
    imageClass: "h-14 w-14",
    placeholderSize: "md" as const,
    glowOpacity: 0.4,
  },
  md: {
    container: "h-16 w-16",
    image: { width: 64, height: 64 },
    imageClass: "h-16 w-16",
    placeholderSize: "lg" as const,
    glowOpacity: 0.5,
  },
};

export function CardHeader({
  imageUrl,
  title,
  subtitle,
  status,
  icon,
  size = "sm",
  showGlow = true,
  showMusicBadge = false,
  contentType = ContentType.enum.track,
  dataCyPrefix = "card",
}: CardHeaderProps) {
  const config = sizeConfig[size];
  const TypeIcon = getContentTypeIcon(contentType);
  const typeLabel = getContentTypeLabel(contentType);
  const typeColor = getContentTypeColor(contentType);
  const PlaceholderIcon = icon ?? TypeIcon;

  return (
    <div className="flex items-center gap-3">
      <div className={cn("relative flex-shrink-0", config.container)}>
        {showGlow && <ImageGlow opacity={config.glowOpacity} />}

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={config.image.width}
            height={config.image.height}
            className={cn("ring-fg/10 relative rounded-lg object-cover shadow-xl ring-1", config.imageClass)}
          />
        ) : (
          <ImagePlaceholder size={config.placeholderSize} icon={PlaceholderIcon} />
        )}

        {showMusicBadge && (
          <div className={musicBadge()} aria-label={typeLabel} title={typeLabel} data-cy={`${dataCyPrefix}-type-badge`}>
            <TypeIcon className={cn("h-3 w-3", typeColor)} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className={cn("text-fg truncate text-sm font-semibold", size === "md" ? "mb-0.5" : "leading-tight")}
          data-cy={`${dataCyPrefix}-title`}
        >
          {title}
        </h3>
        <p
          className={cn("text-fg/50 truncate text-xs", size === "sm" && "mt-0.5")}
          data-cy={`${dataCyPrefix}-subtitle`}
        >
          {subtitle}
        </p>
      </div>

      <StatusBadge
        status={status}
        size={size === "sm" ? "md" : undefined}
        className={size === "md" ? "self-start" : undefined}
        data-cy={`${dataCyPrefix}-status-badge`}
      />
    </div>
  );
}
