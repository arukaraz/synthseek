"use client";

import { Ban, Loader2, Music, RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { lengthLabel } from "../helpers";
import {
  busyChip,
  desktopOnly,
  fileLength,
  fileLengthMobile,
  fileMain,
  filePath,
  fileRow,
  fileTitle,
  rowActions,
} from "../styles";
import type { FileRowProps } from "../types";
import { ActionMenu } from "./ActionMenu";

export function FileRow({ file, tab, busy, onMatchSong, onRetry, onIgnore }: FileRowProps) {
  const { t } = useTranslation("settings");

  return (
    <li className={fileRow()}>
      <div className={fileMain()}>
        <span className={fileTitle()}>{file.title}</span>
        <span className={filePath()} title={file.relativePath}>
          {file.fileName}
        </span>
        <span className={fileLengthMobile()}>{lengthLabel(file.durationSeconds)}</span>
      </div>
      <span className={fileLength()}>{lengthLabel(file.durationSeconds)}</span>
      <div className={rowActions()}>
        {tab === "review" && file.retrying ? (
          <span className={busyChip()}>
            <Loader2 className="animate-spin" aria-hidden />
            {t("libraryScan.review.searching")}
          </span>
        ) : null}
        {tab === "review" && !file.retrying ? (
          <>
            <Button variant="ghost" size="sm" className={desktopOnly()} onClick={onMatchSong} disabled={busy}>
              <Music aria-hidden />
              {t("libraryScan.review.actions.matchSong")}
            </Button>
            <ActionMenu
              label={t("libraryScan.review.moreActions", { name: file.title })}
              disabled={busy}
              items={[
                {
                  key: "match",
                  icon: Music,
                  label: t("libraryScan.review.actions.matchSong"),
                  help: t("libraryScan.review.actions.matchSongHelp"),
                  onSelect: onMatchSong,
                },
                {
                  key: "retry",
                  icon: RotateCw,
                  label: t("libraryScan.review.actions.retry"),
                  help: t("libraryScan.review.actions.retryHelp"),
                  onSelect: onRetry,
                },
                {
                  key: "ignore",
                  icon: Ban,
                  label: t("libraryScan.review.actions.ignore"),
                  help: t("libraryScan.review.actions.ignoreHelp", { count: 1 }),
                  onSelect: onIgnore,
                },
              ]}
            />
          </>
        ) : null}
      </div>
    </li>
  );
}
