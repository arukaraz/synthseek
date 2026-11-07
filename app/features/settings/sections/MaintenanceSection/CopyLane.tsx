"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { fractionOf, lengthOf, startOf } from "@hooks/ui/copyComparison";
import { formatBytes } from "@utils/formatters";

import {
  dupDiffSpan,
  dupDiffStrip,
  dupFileName,
  dupFormat,
  dupLane,
  dupLaneBox,
  dupLaneToggle,
  dupMetaLine,
  dupMetaRow,
  dupPathBadge,
  dupStateBadge,
  dupStat,
  dupTrack,
  dupWave,
} from "../../styles";
import { WAVEFORM } from "./constants";
import { clockLabel, positionAtPointer, waveformPath } from "./helpers";
import { insetSpanStyle, spanStyle } from "./styles";
import type { CopyLaneProps } from "./types";

export function CopyLane({ copy, index, comparison, compared, isReference, showPath, busy, onKeep }: CopyLaneProps) {
  const { t } = useTranslation("settings");
  const { bounds, aligned, durations } = comparison;
  const on = comparison.sounding.has(copy.id);
  const broken = comparison.broken.has(copy.id);
  const length = lengthOf(compared, durations);
  const begins = fractionOf(startOf(compared, aligned), bounds);
  const spans = length <= 0 ? 0 : length / Math.max(bounds.end - bounds.start, length);

  return (
    <div className={dupLane()}>
      <button
        type="button"
        className={dupLaneToggle({ on })}
        aria-pressed={on}
        disabled={broken}
        aria-label={t("libraryScan.duplicates.soundCopy", { number: index + 1 })}
        onClick={() => comparison.toggleCopy(copy.id)}
      >
        {index + 1}
      </button>
      <div className={dupLaneBox()}>
        <div
          className={dupTrack()}
          onPointerDown={(event) =>
            comparison.seek(positionAtPointer(event.clientX, event.currentTarget.getBoundingClientRect(), bounds))
          }
        >
          {copy.peaks === null ? null : (
            <svg
              className={dupWave({ on })}
              style={spanStyle(begins, spans)}
              viewBox={`0 0 ${copy.peaks.length} ${WAVEFORM.HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={waveformPath(copy.peaks)} stroke="currentColor" strokeWidth={0.6} />
            </svg>
          )}
        </div>
        {isReference ? null : (
          <div className={dupDiffStrip()} style={insetSpanStyle(begins, spans)}>
            {copy.differences.map((span) => (
              <span
                key={span.from}
                className={dupDiffSpan()}
                title={`${clockLabel(span.from)} - ${clockLabel(span.to)}`}
                style={spanStyle(
                  length <= 0 ? 0 : span.from / length,
                  length <= 0 ? 0 : (span.to - span.from) / length
                )}
              />
            ))}
          </div>
        )}
        <div className={dupMetaRow()}>
          <div className={dupMetaLine()}>
            <span className={dupFormat()}>{copy.fileFormat}</span>
            <span className={dupStat()}>
              {length > 0 ? `${formatBytes(copy.sizeBytes)} • ${clockLabel(length)}` : formatBytes(copy.sizeBytes)}
            </span>
            {copy.serving ? (
              <span className={dupStateBadge({ tone: "success" })}>{t("libraryScan.duplicates.inLibrary")}</span>
            ) : null}
            {broken ? (
              <span className={dupStateBadge({ tone: "destructive" })}>{t("libraryScan.duplicates.wontPlay")}</span>
            ) : null}
            {showPath ? <span className={dupPathBadge()}>{copy.libraryPath}</span> : null}
            <span className={dupFileName()} title={copy.relativePath}>
              {copy.fileName}
            </span>
          </div>
          <Button size="sm" variant="secondary" disabled={busy} onClick={onKeep}>
            {t("libraryScan.duplicates.keepThis")}
          </Button>
        </div>
      </div>
    </div>
  );
}
