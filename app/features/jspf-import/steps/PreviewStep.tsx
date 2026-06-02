"use client";

import { Button } from "@components/ui/Button";
import { ProgressBar } from "@components/ui/ProgressBar";
import { usePortabilityProgress } from "@hooks/api/subscriptions/usePortabilityProgress";
import { useState } from "react";

import { TrackCoverageRow } from "../components/TrackCoverageRow";
import {
  coverageLabel,
  formatDurationMs,
  newDownloadsCount,
  orderedTrackEntries,
  selectedCount,
  selectedDurationMs,
  totalMatched,
  trackKey,
} from "../helpers";
import {
  coverageHeader,
  coverageHeaderStat,
  coverageHeaderStrong,
  coverageList,
  errorText,
  footerRow,
  progressLabel,
  progressWrap,
  searchInput,
  sectionHeader,
  stepContainer,
} from "../styles";
import type { PreviewStepProps } from "../types";

export function PreviewStep({
  jobId,
  preview,
  isPreviewing,
  isCommitting,
  errorMessage,
  selected,
  onToggleTrack,
  onConfirm,
  onBack,
}: PreviewStepProps) {
  const progress = usePortabilityProgress(jobId);
  const [search, setSearch] = useState("");
  const busy = isPreviewing || isCommitting;
  const percent = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  if (busy) {
    return (
      <div className={progressWrap()}>
        <ProgressBar progress={percent} isActive />
        <span className={progressLabel()}>
          {isCommitting ? "Creating requests" : "Matching tracks"}
          {progress ? ` · ${progress.processed}/${progress.total}` : "..."}
        </span>
      </div>
    );
  }

  if (errorMessage && !preview) {
    return (
      <div className={stepContainer()}>
        <span className={errorText()}>{errorMessage}</span>
        <div className={footerRow()}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className={progressWrap()}>
        <ProgressBar progress={percent} isActive />
        <span className={progressLabel()}>Matching tracks...</span>
      </div>
    );
  }

  const total = preview.collections.reduce((sum, collection) => sum + collection.total, 0);
  const matched = totalMatched(preview);
  const downloads = newDownloadsCount(preview, selected);
  const chosen = selectedCount(preview, selected);
  const duration = formatDurationMs(selectedDurationMs(preview, selected));

  return (
    <div className={stepContainer()}>
      <div className={coverageHeader()}>
        <span className={coverageHeaderStrong()}>
          {matched}/{total} matched
        </span>
        <span className={coverageHeaderStat()}>{downloads} new downloads</span>
        <span className={coverageHeaderStat()}>{duration} selected</span>
      </div>

      <input
        className={searchInput()}
        type="search"
        placeholder="Filter tracks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className={coverageList()}>
        {preview.collections.map((collection, collectionIndex) => {
          const entries = orderedTrackEntries(collection.tracks, search);
          if (entries.length === 0) return null;
          return (
            <div key={`${collection.name}-${collectionIndex}`}>
              {preview.collections.length > 1 ? (
                <div className={sectionHeader()}>
                  {collection.name} · {coverageLabel(collection)}
                </div>
              ) : null}
              {entries.map(([trackIndex, track]) => (
                <TrackCoverageRow
                  key={trackKey(collectionIndex, trackIndex)}
                  track={track}
                  selected={selected.has(trackKey(collectionIndex, trackIndex))}
                  onToggle={() => onToggleTrack(collectionIndex, trackIndex)}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className={footerRow()}>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Back
        </Button>
        <Button variant="default" size="sm" disabled={chosen === 0} onClick={onConfirm}>
          Import {chosen} track{chosen === 1 ? "" : "s"}
        </Button>
      </div>
    </div>
  );
}
