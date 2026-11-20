"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { useRemovePlaylistCover } from "@hooks/api/mutations/playlists/useRemovePlaylistCover";
import { useUploadPlaylistCover } from "@hooks/api/mutations/playlists/useUploadPlaylistCover";
import { artworkImage } from "@utils/artworkProxy";
import { ImageUp, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { detailInitials } from "../../helpers";
import {
  coverActions,
  coverBlock,
  coverButton,
  coverPreview,
  coverPreviewInitials,
  coverScrim,
  workshopCoverImage,
} from "./styles";
import type { WorkshopCoverProps } from "./types";

export function WorkshopCover({ playlistId, name, cover, hasCustomCover, maxBytes, accept }: WorkshopCoverProps) {
  const { t } = useTranslation("contentDetail");
  const picker = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadPlaylistCover(playlistId, maxBytes);
  const removeCover = useRemovePlaylistCover();
  const busy = isUploading || removeCover.isPending;
  const uploadLabel = t(hasCustomCover ? "workshop.details.replaceCover" : "workshop.details.uploadCover");
  const removeLabel = t("workshop.details.removeCover");

  return (
    <div className={coverBlock()}>
      <span className={coverPreview()}>
        {cover ? (
          <Image
            {...artworkImage(cover)}
            alt=""
            fill
            sizes="(min-width: 1280px) 264px, 320px"
            className={workshopCoverImage()}
          />
        ) : (
          <span aria-hidden className={coverPreviewInitials()}>
            {detailInitials(name)}
          </span>
        )}
        <span aria-hidden className={coverScrim()} />
      </span>
      <input
        ref={picker}
        type="file"
        hidden
        accept={accept.join(",")}
        data-cy="workshop-cover-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      <TooltipProvider delayDuration={150}>
        <div className={coverActions()}>
          {hasCustomCover ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={coverButton({ tone: "danger" })}
                  disabled={busy}
                  onClick={() => removeCover.mutate({ playlistId })}
                  aria-label={removeLabel}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </TooltipTrigger>
              <TooltipContent>{removeLabel}</TooltipContent>
            </Tooltip>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={coverButton()}
                disabled={busy}
                onClick={() => picker.current?.click()}
                aria-label={uploadLabel}
              >
                <ImageUp className="size-4.5" aria-hidden />
              </button>
            </TooltipTrigger>
            <TooltipContent>{uploadLabel}</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
