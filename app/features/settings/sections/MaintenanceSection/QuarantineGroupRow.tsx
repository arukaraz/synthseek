"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";

import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { formatRelativeTime } from "@utils/formatters";

import { QUARANTINE_FILENAME_MAX } from "./constants";
import { truncateMiddle } from "./helpers";
import {
  quarantineFilename,
  quarantineMeta,
  quarantineReasonBadge,
  quarantineRow,
  quarantineRowBody,
  quarantineTrackList,
  quarantineTracksToggle,
} from "./styles";
import type { QuarantineGroupRowProps } from "./types";

export function QuarantineGroupRow({ group, removing, onRemove }: QuarantineGroupRowProps) {
  const { t } = useTranslation("settings");
  const sourceLabel = useDownloadSourceLabel();
  const [expanded, setExpanded] = useState(false);
  const single = group.trackCount === 1 ? group.tracks[0] : undefined;

  return (
    <li className={quarantineRow()}>
      <div className={quarantineRowBody()}>
        <span className={quarantineFilename()} title={group.filename}>
          {truncateMiddle(group.filename, QUARANTINE_FILENAME_MAX)}
        </span>
        <div className={quarantineMeta()}>
          <span title={t("quarantine.list.columns.source")}>{sourceLabel(group.source)}</span>
          {group.username.length > 0 ? <span title={t("quarantine.list.columns.peer")}>{group.username}</span> : null}
          <span className={quarantineReasonBadge()} title={t("quarantine.list.columns.reason")}>
            {t(`quarantine.reason.${group.reason}`)}
          </span>
          <span title={t("quarantine.list.columns.age")}>{formatRelativeTime(group.createdAt)}</span>
          {single ? (
            <span title={t("quarantine.list.columns.track")}>
              {t("quarantine.list.trackDisplay", { title: single.title, artist: single.artist })}
            </span>
          ) : group.trackCount > 1 ? (
            <button
              type="button"
              className={quarantineTracksToggle()}
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              {t("quarantine.list.trackCount", { count: group.trackCount })}
              {expanded ? <ChevronUp className="size-3" aria-hidden /> : <ChevronDown className="size-3" aria-hidden />}
            </button>
          ) : null}
        </div>
        {expanded && group.tracks.length > 0 ? (
          <ul className={quarantineTrackList()}>
            {group.tracks.map((track, index) => (
              <li key={`${track.title}-${index}`}>
                {t("quarantine.list.trackDisplay", { title: track.title, artist: track.artist })}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <IconButton
        icon={X}
        size="sm"
        aria-label={t("quarantine.list.remove")}
        onClick={() => onRemove(group)}
        disabled={removing}
      />
    </li>
  );
}
