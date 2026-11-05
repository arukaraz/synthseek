"use client";

import { Link2, Unlink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { lengthLabel } from "../helpers";
import { doubtActions, doubtChip, doubtFile, doubtRow, fileTitle, groupTitle } from "../styles";
import type { DoubtRowProps } from "../types";

export function DoubtRow({ doubt, busy, onKeep, onReject }: DoubtRowProps) {
  const { t } = useTranslation("settings");

  return (
    <li className={doubtRow()}>
      <span className={groupTitle()} title={doubt.relativePath}>
        {t("libraryScan.review.groupTitle", {
          artist: doubt.artist ?? t("libraryScan.review.unknownArtist"),
          name: doubt.album ?? doubt.fileName,
        })}
      </span>
      <div className={doubtFile()}>
        <span className={fileTitle()}>{doubt.title}</span>
        <span className="tabular-nums">{lengthLabel(doubt.durationSeconds)}</span>
        <span className="uppercase">{doubt.format}</span>
      </div>
      <span className={doubtChip()}>
        {t("libraryScan.review.doubt.linkedTo", {
          title: doubt.linkedTo.title,
          length: lengthLabel(doubt.linkedTo.durationSeconds),
        })}
      </span>
      <div className={doubtActions()}>
        <Button variant="secondary" size="sm" onClick={onKeep} disabled={busy}>
          <Link2 aria-hidden />
          {t("libraryScan.review.doubt.keep")}
        </Button>
        <Button variant="secondary" size="sm" onClick={onReject} disabled={busy}>
          <Unlink aria-hidden />
          {t("libraryScan.review.doubt.reject")}
        </Button>
      </div>
    </li>
  );
}
