"use client";

import { PreviewButton, PreviewTime } from "@components/ui/PreviewButton";
import { catalogPreviewClip, useTrackPreview } from "@hooks/ui/trackPreview";
import { artworkImage } from "@utils/artworkProxy";
import { Download, EyeOff, Pause, Play, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { coverInitials, libraryCopyId } from "./helpers";
import {
  suggestedAdd,
  suggestedAddLong,
  suggestedArtist,
  suggestedCover,
  suggestedCoverImage,
  suggestedCoverInitials,
  suggestedHide,
  suggestedInfo,
  suggestedListen,
  suggestedName,
  suggestedRow,
} from "./styles";
import type { SuggestedTrackRowProps } from "./types";

export function SuggestedTrackRow({ track, slot, presence, adding, onPlay, onHide, onAdd }: SuggestedTrackRowProps) {
  const { t } = useTranslation("components");
  const preview = useTrackPreview(catalogPreviewClip(track.externalId, track.title, slot));
  const inLibrary = libraryCopyId(track) !== null;
  const playing = presence === "playing";
  const cover = track.album?.cover ?? null;
  const ListenGlyph = playing ? Pause : Play;
  const AddGlyph = inLibrary ? Plus : Download;
  const playLabel = t(playing ? "suggestedTracks.pause" : "suggestedTracks.play", { title: track.title });
  const hideLabel = t("suggestedTracks.hide", { title: track.title });
  const addLabel = t(inLibrary ? "suggestedTracks.addLabel" : "suggestedTracks.requestAndAddLabel", {
    title: track.title,
  });

  return (
    <li className={suggestedRow()}>
      {inLibrary ? (
        <button type="button" className={suggestedListen({ active: playing })} onClick={onPlay} aria-label={playLabel}>
          <ListenGlyph className="size-4 fill-current" aria-hidden />
        </button>
      ) : (
        <PreviewButton
          title={track.title}
          status={preview.status}
          clock={preview.clock}
          available={track.hasPreview}
          onToggle={preview.toggle}
        />
      )}

      <span className={suggestedCover()}>
        {cover ? (
          <Image {...artworkImage(cover)} alt="" fill sizes="40px" className={suggestedCoverImage()} />
        ) : (
          <span aria-hidden className={suggestedCoverInitials()}>
            {coverInitials(track.title)}
          </span>
        )}
      </span>

      <span className={suggestedInfo()}>
        <span className={suggestedName()}>{track.title}</span>
        {preview.clock ? (
          <span className={suggestedArtist({ previewing: true })}>
            <PreviewTime clock={preview.clock} />
          </span>
        ) : (
          <span className={suggestedArtist()}>{track.artist}</span>
        )}
      </span>

      <button type="button" className={suggestedHide()} onClick={onHide} title={hideLabel} aria-label={hideLabel}>
        <EyeOff className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        className={suggestedAdd({ tone: inLibrary ? "add" : "request" })}
        onClick={onAdd}
        disabled={adding}
        aria-label={addLabel}
      >
        <AddGlyph className="size-3.5 shrink-0" aria-hidden />
        {inLibrary ? (
          <span>{t("suggestedTracks.add")}</span>
        ) : (
          <span>
            {t("suggestedTracks.request")}
            <span className={suggestedAddLong()}>{t("suggestedTracks.andAdd")}</span>
          </span>
        )}
      </button>
    </li>
  );
}
