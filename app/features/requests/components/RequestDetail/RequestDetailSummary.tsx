"use client";

import { ContentType, RequestStatus } from "@api/__generated__/types";
import { Button } from "@components/ui/Button";
import { cn } from "@utils/cn";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TRACK_GROUP_STYLE } from "./consts";
import { countTrackGroups, formatDelegatedTo, presentTrackGroups } from "./helpers";
import {
  summaryBar,
  summaryBarSegment,
  summaryBlock,
  summaryChips,
  summaryFigure,
  summaryFigurePart,
  summaryFraction,
  summaryMeta,
  summaryNote,
} from "./styles";
import { SummaryFilterChip } from "./SummaryFilterChip";
import type { RequestDetailSummaryProps } from "./types";

export function RequestDetailSummary({
  request,
  tracks,
  isResolving,
  filter,
  onToggleFilter,
  onClearFilter,
}: RequestDetailSummaryProps) {
  const { t } = useTranslation("requests");

  if (request.status === RequestStatus.enum.delegated) {
    return (
      <div className={summaryBlock()}>
        <div className={summaryNote()} data-cy="request-delegated-note">
          <p className="text-fg font-medium">
            {t("summary.delegatedTitle", { name: formatDelegatedTo(request.delegated_to) ?? t("summary.manager") })}
          </p>
          <p className={summaryMeta()}>{t("summary.delegatedDescription")}</p>
        </div>
      </div>
    );
  }

  const counts = countTrackGroups(tracks);
  const groups = presentTrackGroups(counts);
  const total = isResolving ? request.requested_tracks || request.total_tracks : tracks.length;
  const done = isResolving ? request.completed_tracks : counts.done;
  const active = isResolving ? 0 : counts.active;
  const missing = Math.max(0, request.total_tracks - (request.requested_tracks || request.total_tracks));
  const isPlaylist = request.contentType === ContentType.enum.playlist;
  const meta = [
    active > 0 ? t("summary.doneAndActive", { done, active, count: done }) : t("summary.done", { count: done }),
    missing > 0
      ? t(isPlaylist ? "stats.tracksOfPlaylist" : "stats.tracksOfAlbum", {
          requested: total,
          total: request.total_tracks,
        })
      : null,
    request.duplicateCount > 0 ? t("summary.duplicates", { count: request.duplicateCount }) : null,
  ].filter((part) => part !== null);

  return (
    <div className={summaryBlock()} data-cy="request-summary">
      <div className={summaryFraction()}>
        <span className={summaryFigure()} aria-label={t("summary.figureLabel", { done, active, total })}>
          {done}
          {active > 0 ? <span className={summaryFigurePart({ tone: "active" })}>+{active}</span> : null}
          <span className={summaryFigurePart({ tone: "total" })}>/{total}</span>
        </span>
        <span className={summaryMeta()}>{meta.join(" · ")}</span>
      </div>

      {isResolving ? null : (
        <>
          <div
            className={summaryBar()}
            role="img"
            aria-label={groups.map((group) => `${counts[group]} ${t(`summary.groups.${group}`)}`).join(", ")}
          >
            {groups.map((group) => (
              <span
                key={group}
                className={cn(summaryBarSegment(), TRACK_GROUP_STYLE[group].fill)}
                style={{ flexGrow: counts[group] }}
              />
            ))}
          </div>
          <div className={summaryChips()} role="group" aria-label={t("summary.filterLabel")}>
            {groups.map((group) => (
              <SummaryFilterChip
                key={group}
                group={group}
                count={counts[group]}
                active={filter.has(group)}
                dimmed={filter.size > 0 && !filter.has(group)}
                onToggle={onToggleFilter}
              />
            ))}
            {filter.size > 0 ? (
              <Button variant="ghost" size="sm" onClick={onClearFilter}>
                <X className="mr-1 size-3.5" aria-hidden />
                {t("summary.clearFilter")}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
