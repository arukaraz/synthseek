"use client";

import { Ban, ChevronDown, ChevronUp, Disc3, Folder, Loader2, Music, RotateCw, Undo2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { formatRelativeTime } from "@utils/formatters";

import { FILES_PREVIEW_COUNT } from "../constants";
import { groupFileIds, groupName, lengthLabel } from "../helpers";
import {
  busyChip,
  desktopOnly,
  fileList,
  filesToggle,
  groupInfo,
  groupMeta,
  groupRow,
  groupThumb,
  groupTitle,
  rowActions,
  selectCell,
  showMoreRow,
} from "../styles";
import type { GroupRowProps } from "../types";
import { ActionMenu } from "./ActionMenu";
import { FileRow } from "./FileRow";

export function GroupRow({
  group,
  tab,
  selected,
  previewTone,
  busy,
  onSelect,
  onPreviewHover,
  onMatchAlbum,
  onMatchSong,
  onRetry,
  onIgnore,
  onStopIgnoring,
}: GroupRowProps) {
  const { t } = useTranslation("settings");
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const multi = group.fileCount > 1;
  const firstFile = group.files[0];
  const title = t("libraryScan.review.groupTitle", {
    artist: group.artist ?? t("libraryScan.review.unknownArtist"),
    name: groupName(group),
  });
  const Thumb = !multi ? Music : group.discCount > 1 || group.fileCount > 3 ? Disc3 : Folder;
  const searchingAgain = tab === "review" && group.retrying > 0;
  const visibleFiles = showAll ? group.files : group.files.slice(0, FILES_PREVIEW_COUNT);
  const matchGroup = () => (multi || !firstFile ? onMatchAlbum() : onMatchSong(firstFile));

  return (
    <li className={groupRow({ selected })} data-range-preview={previewTone === "none" ? undefined : previewTone}>
      {tab === "review" ? (
        <span
          className={selectCell()}
          onMouseEnter={() => onPreviewHover(true)}
          onMouseLeave={() => onPreviewHover(false)}
          onMouseDownCapture={(event) => {
            if (event.shiftKey) event.preventDefault();
          }}
          onClickCapture={(event) => {
            event.preventDefault();
            onSelect(event.shiftKey);
            const box = event.currentTarget.querySelector('[role="checkbox"]');
            if (box instanceof HTMLElement) box.focus();
          }}
        >
          <Checkbox
            checked={selected}
            preview={previewTone}
            aria-label={t("libraryScan.review.selectGroup", { name: title })}
          />
        </span>
      ) : (
        <span className={selectCell()} />
      )}

      <span className={groupThumb()}>
        <Thumb aria-hidden />
      </span>

      <div className={groupInfo()}>
        <span className={groupTitle()} title={group.folder}>
          {title}
        </span>
        <span className={groupMeta({ busy: searchingAgain })}>
          {searchingAgain ? (
            t("libraryScan.review.searchingAgain")
          ) : (
            <>
              {multi ? (
                <button
                  type="button"
                  className={filesToggle()}
                  aria-expanded={expanded}
                  onClick={() => setExpanded((open) => !open)}
                >
                  {t("libraryScan.review.files", { count: group.fileCount })}
                  {expanded ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
                </button>
              ) : (
                <span>{t("libraryScan.review.files", { count: 1 })}</span>
              )}
              {group.discCount > 1 ? <span>{t("libraryScan.review.discs", { count: group.discCount })}</span> : null}
              {!multi && firstFile ? <span>{lengthLabel(firstFile.durationSeconds)}</span> : null}
              {tab === "ignored" && group.ignoredAt ? (
                <span>
                  {t("libraryScan.review.ignoredWhen", { when: formatRelativeTime(new Date(group.ignoredAt)) })}
                </span>
              ) : null}
            </>
          )}
        </span>
      </div>

      <div className={rowActions()}>
        {tab === "review" && searchingAgain ? (
          <span className={busyChip()}>
            <Loader2 className="animate-spin" aria-hidden />
            {t("libraryScan.review.searching")}
          </span>
        ) : null}
        {tab === "review" && !searchingAgain ? (
          <>
            <Button size="sm" className={desktopOnly()} onClick={matchGroup} disabled={busy}>
              {multi ? <Disc3 aria-hidden /> : <Music aria-hidden />}
              {multi ? t("libraryScan.review.actions.matchAlbum") : t("libraryScan.review.actions.matchSong")}
            </Button>
            <ActionMenu
              label={t("libraryScan.review.moreActions", { name: title })}
              disabled={busy}
              items={[
                {
                  key: "match",
                  icon: multi ? Disc3 : Music,
                  label: multi ? t("libraryScan.review.actions.matchAlbum") : t("libraryScan.review.actions.matchSong"),
                  help: multi
                    ? t("libraryScan.review.actions.matchAlbumHelp")
                    : t("libraryScan.review.actions.matchSongHelp"),
                  onSelect: matchGroup,
                },
                {
                  key: "retry",
                  icon: RotateCw,
                  label: t("libraryScan.review.actions.retry"),
                  help: t("libraryScan.review.actions.retryHelp"),
                  onSelect: () => onRetry(groupFileIds(group)),
                },
                {
                  key: "ignore",
                  icon: Ban,
                  label: multi
                    ? t("libraryScan.review.match.ignoreFiles", { count: group.fileCount })
                    : t("libraryScan.review.actions.ignore"),
                  help: t("libraryScan.review.actions.ignoreHelp", { count: group.fileCount }),
                  onSelect: () => onIgnore(groupFileIds(group)),
                },
              ]}
            />
          </>
        ) : null}
        {tab === "ignored" ? (
          <Button variant="secondary" size="sm" onClick={() => onStopIgnoring(groupFileIds(group))} disabled={busy}>
            <Undo2 aria-hidden />
            {t("libraryScan.review.actions.stopIgnoring")}
          </Button>
        ) : null}
      </div>

      {multi && expanded ? (
        <ul className={fileList()}>
          {visibleFiles.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              tab={tab}
              busy={busy}
              onMatchSong={() => onMatchSong(file)}
              onRetry={() => onRetry([file.id])}
              onIgnore={() => onIgnore([file.id])}
            />
          ))}
          {group.fileCount > FILES_PREVIEW_COUNT ? (
            <li className={showMoreRow()}>
              <button type="button" className={filesToggle()} onClick={() => setShowAll((all) => !all)}>
                {showAll
                  ? t("libraryScan.review.showFewer")
                  : t("libraryScan.review.showAll", { count: group.fileCount })}
                {showAll ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </li>
  );
}
