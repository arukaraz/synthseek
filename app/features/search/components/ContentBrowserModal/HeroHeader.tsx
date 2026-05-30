"use client";

import { Button } from "@components/ui/Button";
import { Badge } from "@components/ui/Badge";
import { ContentType } from "@api/__generated__/types";
import { glassContainer, imagePlaceholder } from "@theme/utilities/styles";
import { heroContentContainer } from "../styles";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { RequestAllButton } from "./RequestAllButton";
import type { HeroHeaderProps } from "./types";

export function HeroHeader({
  metadata,
  type,
  onRequestAll,
  onBack,
  requestButtonDisabled,
  requestButtonTooltip,
}: HeroHeaderProps) {
  const { title, subtitle, metadata: metadataText, thumbnail, showRequestButton } = metadata;

  const isArtist = type === ContentType.enum.artist;

  return (
    <div className="h-hero-responsive relative" data-cy="content-browser-header">
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover object-center"
          data-cy="content-browser-cover"
          priority
        />
      ) : (
        <div className={imagePlaceholder({ gradient: "subtle", rounded: "none" })} />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {onBack && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className={`${glassContainer({ blur: "sm", rounded: "lg", border: "default" })} text-fg hover:bg-surface/60`}
            data-cy="content-browser-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Back</span>
          </Button>
        </div>
      )}

      <div className={heroContentContainer()}>
        <div className="flex items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            {isArtist && <Badge className="bg-primary-500 text-overlay-fg mb-2 border-0">Artist</Badge>}

            <h1
              className="text-overlay-fg text-2xl font-bold drop-shadow-lg sm:text-3xl lg:text-4xl"
              data-cy="content-browser-title"
            >
              {title}
            </h1>

            {subtitle && (
              <p className="text-overlay-fg/80 text-sm" data-cy="content-browser-subtitle">
                {subtitle}
              </p>
            )}

            {metadataText && <p className="text-overlay-fg/60 text-sm">{metadataText}</p>}
          </div>

          {showRequestButton && onRequestAll ? (
            <RequestAllButton
              onRequestAll={onRequestAll}
              disabled={requestButtonDisabled}
              tooltip={requestButtonTooltip}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
