"use client";

import { Button } from "@components/ui/Button";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { sortNote, sortNoteLabel } from "./styles";
import type { TrackSortNoteProps } from "./types";

export function TrackSortNote({ sort, isPlaylist, onReset }: TrackSortNoteProps) {
  const { t } = useTranslation("requests");
  const column = t(`trackSort.columns.${sort.key}`);

  return (
    <div className={sortNote()} role="status">
      <span className={sortNoteLabel()}>
        {sort.direction === "asc" ? <ArrowUp aria-hidden /> : <ArrowDown aria-hidden />}
        {t(sort.direction === "asc" ? "trackSort.sortedAsc" : "trackSort.sortedDesc", { column })}
      </span>
      <Button variant="ghost" size="sm" onClick={onReset}>
        <X className="mr-1 size-3.5" aria-hidden />
        {t(isPlaylist ? "trackSort.resetPlaylist" : "trackSort.resetAlbum")}
      </Button>
      {sort.key === "status" ? <span>{t("trackSort.statusMoves")}</span> : null}
    </div>
  );
}
