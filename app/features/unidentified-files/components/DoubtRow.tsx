"use client";

import { Link2, Music, Unlink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { lengthLabel } from "../helpers";
import {
  desktopOnly,
  doubtMeta,
  doubtPath,
  doubtTagged,
  groupInfo,
  groupRow,
  groupThumb,
  groupTitle,
  mobileOnly,
  rowActions,
  selectCell,
} from "../styles";
import type { DoubtRowProps } from "../types";
import { ActionMenu } from "./ActionMenu";

export function DoubtRow({ doubt, busy, onKeep, onReject }: DoubtRowProps) {
  const { t } = useTranslation("settings");
  const linked = doubt.linkedTo;
  const linkedLabel =
    linked.durationSeconds === null
      ? t("libraryScan.review.doubt.linkedToNoLength", { artist: linked.artist, title: linked.title })
      : t("libraryScan.review.doubt.linkedTo", {
          artist: linked.artist,
          title: linked.title,
          length: lengthLabel(linked.durationSeconds),
        });

  const tagged = doubt.taggedAs;
  const taggedLabel =
    tagged.title === null
      ? null
      : tagged.artist === null
        ? t("libraryScan.review.doubt.taggedAsNoArtist", { title: tagged.title })
        : t("libraryScan.review.doubt.taggedAs", { artist: tagged.artist, title: tagged.title });

  return (
    <li className={groupRow()}>
      <span className={selectCell()} />

      <span className={groupThumb()}>
        <Music aria-hidden />
      </span>

      <div className={groupInfo()}>
        <span className={groupTitle()} title={linkedLabel}>
          {linkedLabel}
        </span>
        <span className={doubtMeta()}>
          {taggedLabel === null ? null : (
            <span className={doubtTagged()} title={taggedLabel}>
              {taggedLabel}
            </span>
          )}
          <span className={doubtPath()} title={doubt.relativePath}>
            {doubt.relativePath}
          </span>
          <span className="shrink-0 tabular-nums">{lengthLabel(doubt.durationSeconds)}</span>
          <span className="shrink-0 uppercase">{doubt.format}</span>
        </span>
      </div>

      <div className={rowActions()}>
        <Button variant="secondary" size="sm" className={desktopOnly()} onClick={onKeep} disabled={busy}>
          <Link2 aria-hidden />
          {t("libraryScan.review.doubt.keep")}
        </Button>
        <Button variant="secondary" size="sm" className={desktopOnly()} onClick={onReject} disabled={busy}>
          <Unlink aria-hidden />
          {t("libraryScan.review.doubt.reject")}
        </Button>
        <span className={mobileOnly()}>
          <ActionMenu
            label={t("libraryScan.review.moreActions", { name: doubt.relativePath })}
            disabled={busy}
            items={[
              { key: "keep", icon: Link2, label: t("libraryScan.review.doubt.keep"), onSelect: onKeep },
              { key: "reject", icon: Unlink, label: t("libraryScan.review.doubt.reject"), onSelect: onReject },
            ]}
          />
        </span>
      </div>
    </li>
  );
}
