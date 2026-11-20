"use client";

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
  workshopCoverImage,
  workshopCoverInitials,
} from "./styles";
import type { WorkshopCoverProps } from "./types";

export function WorkshopCover({ playlistId, name, cover, hasCustomCover, maxBytes, accept }: WorkshopCoverProps) {
  const { t } = useTranslation("contentDetail");
  const picker = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useUploadPlaylistCover(playlistId, maxBytes);
  const removeCover = useRemovePlaylistCover();
  const busy = isUploading || removeCover.isPending;

  return (
    <div className={coverBlock()}>
      <span className={coverPreview()}>
        {cover ? (
          <Image {...artworkImage(cover)} alt="" fill sizes="72px" className={workshopCoverImage()} />
        ) : (
          <span aria-hidden className={workshopCoverInitials()}>
            {detailInitials(name)}
          </span>
        )}
      </span>
      <div className={coverActions()}>
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
        <button type="button" className={coverButton()} disabled={busy} onClick={() => picker.current?.click()}>
          <ImageUp className="size-4 shrink-0" aria-hidden />
          {t(hasCustomCover ? "workshop.details.replaceCover" : "workshop.details.uploadCover")}
        </button>
        {hasCustomCover ? (
          <button
            type="button"
            className={coverButton({ tone: "quiet" })}
            disabled={busy}
            onClick={() => removeCover.mutate({ playlistId })}
          >
            <Trash2 className="size-4 shrink-0" aria-hidden />
            {t("workshop.details.removeCover")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
