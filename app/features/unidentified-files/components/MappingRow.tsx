"use client";

import { useTranslation } from "react-i18next";

import { lengthLabel, signedSeconds, verdictTone } from "../helpers";
import { chip, mappingFile, mappingLength, mappingRow, mappingSelect } from "../styles";
import type { MappingRowProps } from "../types";

export function MappingRow({ file, tracks, trackId, onChange }: MappingRowProps) {
  const { t } = useTranslation("settings");
  const track = trackId === null ? undefined : tracks.find((candidate) => candidate.id === trackId);
  const verdict = track ? file.verdicts[track.id] : undefined;
  const otherVersionOnly = tracks.some((candidate) => file.verdicts[candidate.id] === "different_version");

  return (
    <div className={mappingRow()}>
      <span className={mappingFile()} title={file.relativePath}>
        {file.fileName}
      </span>
      <span className={mappingLength()}>{lengthLabel(file.durationSeconds)}</span>
      <select
        className={mappingSelect()}
        value={trackId ?? ""}
        aria-label={t("libraryScan.review.match.songFor", { name: file.title })}
        onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
      >
        <option value="">{t("libraryScan.review.match.leaveForLater")}</option>
        {tracks.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {t("libraryScan.review.match.trackOption", {
              number: candidate.number,
              title: candidate.title,
              length: lengthLabel(candidate.durationSeconds),
            })}
          </option>
        ))}
      </select>
      <span>
        {track && verdict ? (
          <span className={chip({ tone: verdictTone(verdict) })}>
            {verdict === "same" && file.durationSeconds !== null
              ? t("libraryScan.review.match.seconds", {
                  value: signedSeconds(file.durationSeconds - track.durationSeconds),
                })
              : t(`libraryScan.review.match.verdict.${verdict}`)}
          </span>
        ) : (
          <span className={chip({ tone: otherVersionOnly ? "warn" : "neutral" })}>
            {otherVersionOnly
              ? t("libraryScan.review.match.verdict.onlyOtherVersion")
              : t("libraryScan.review.match.verdict.notOnAlbum")}
          </span>
        )}
      </span>
    </div>
  );
}
