"use client";

import { RequestMatchingMode, RequestStatus } from "@api/__generated__/types";
import { useTrackRelease } from "@hooks/api/queries/useActiveReleases";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { formatDateTime, formatTrackDuration } from "@utils/formatters";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  detailActions,
  detailBox,
  detailBoxTitle,
  detailChip,
  detailChips,
  detailEmpty,
  detailFactLabel,
  detailFacts,
  detailFactValue,
  detailGrid,
  detailLink,
  detailPanel,
  detailPath,
  detailPathCopy,
  detailPathText,
  lockedReason,
} from "./styles";
import { trackProvenance } from "./helpers";
import { TrackActionButton } from "./TrackActionButton";
import { TrackDetailHead } from "./TrackDetailHead";
import type { TrackDetailPanelProps } from "./types";

export function TrackDetailPanel({ track, showPrivateDetails, actions, onAction }: TrackDetailPanelProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const release = useTrackRelease(track.id);
  const provenance = trackProvenance(track, release);
  const filePath = showPrivateDetails ? (track.library_path ?? track.downloaded_file) : null;
  const peer = showPrivateDetails ? track.source_peer : null;
  const lock = actions.find((action) => action.lock !== null)?.lock ?? null;
  const isFailed = track.status === RequestStatus.enum.failed;

  const copyPath = async () => {
    if (!filePath) return;
    try {
      await navigator.clipboard.writeText(filePath);
      toast.success(t("trackDetail.pathCopied"));
    } catch {
      toast.error(t("trackDetail.pathCopyFailed"));
    }
  };

  return (
    <div className={detailPanel()} data-cy="track-detail">
      <TrackDetailHead track={track} release={release} showRawError={showPrivateDetails} />

      <div className={detailGrid()}>
        <section className={detailBox()} aria-label={t("trackDetail.requested")}>
          <h3 className={detailBoxTitle()}>{t("trackDetail.requested")}</h3>
          <div className={detailChips()}>
            <span className={detailChip({ strong: true })}>{track.format.toUpperCase()}</span>
            <span className={detailChip()}>{t("trackDetail.bitrate", { value: track.bitrate })}</span>
            <span className={detailChip()}>
              {t(
                track.format_matching === RequestMatchingMode.enum.strict
                  ? "trackDetail.formatStrict"
                  : "trackDetail.formatFlexible"
              )}
            </span>
            <span className={detailChip()}>
              {t(
                track.bitrate_matching === RequestMatchingMode.enum.strict
                  ? "trackDetail.bitrateStrict"
                  : "trackDetail.bitrateFlexible"
              )}
            </span>
            {track.explicit ? <span className={detailChip()}>{t("tracks.explicit")}</span> : null}
            {track.upgrade ? <span className={detailChip()}>{t("trackDetail.upgrade")}</span> : null}
          </div>
          <dl className={detailFacts()}>
            <dt className={detailFactLabel()}>{t("trackDetail.duration")}</dt>
            <dd className={detailFactValue({ mono: true })}>{formatTrackDuration(track.duration_ms)}</dd>
            {track.isrc ? (
              <>
                <dt className={detailFactLabel()}>{t("trackDetail.isrc")}</dt>
                <dd className={detailFactValue({ mono: true })}>{track.isrc}</dd>
              </>
            ) : null}
          </dl>
        </section>

        <section className={detailBox()} aria-label={t("trackDetail.obtained")}>
          <h3 className={detailBoxTitle()}>{t("trackDetail.obtained")}</h3>
          {provenance === null && peer === null && filePath === null && track.file_bitrate === null ? (
            <p className={detailEmpty()}>
              {isFailed
                ? t("trackDetail.noFileAfterAttempts", { count: track.retry_count })
                : t("trackDetail.noSourceYet")}
            </p>
          ) : (
            <dl className={detailFacts()}>
              {provenance !== null ? (
                <>
                  <dt className={detailFactLabel()}>{t("trackDetail.source")}</dt>
                  <dd className={detailFactValue()}>
                    {sourceLabel(provenance.source)}
                    {provenance.license !== null ? (
                      <>
                        {" · "}
                        <a href={provenance.license} target="_blank" rel="noopener noreferrer" className={detailLink()}>
                          {t("tracks.license")}
                        </a>
                      </>
                    ) : null}
                  </dd>
                  {provenance.ref !== null ? (
                    <>
                      <dt className={detailFactLabel()}>{t("trackDetail.item")}</dt>
                      <dd className={detailFactValue({ mono: true })}>{provenance.ref}</dd>
                    </>
                  ) : null}
                </>
              ) : null}
              {peer !== null ? (
                <>
                  <dt className={detailFactLabel()}>{t("trackDetail.peer")}</dt>
                  <dd className={detailFactValue({ mono: true })}>{peer}</dd>
                </>
              ) : null}
              {track.file_bitrate !== null ? (
                <>
                  <dt className={detailFactLabel()}>{t("trackDetail.fileBitrate")}</dt>
                  <dd className={detailFactValue()}>{t("trackDetail.bitrate", { value: track.file_bitrate })}</dd>
                </>
              ) : null}
              {track.retry_count > 0 ? (
                <>
                  <dt className={detailFactLabel()}>{t("trackDetail.attempts")}</dt>
                  <dd className={detailFactValue()}>{track.retry_count}</dd>
                </>
              ) : null}
            </dl>
          )}
          {filePath ? (
            <div className={detailPath()}>
              <span className={detailPathText()}>{filePath}</span>
              <button
                type="button"
                className={detailPathCopy()}
                onClick={() => void copyPath()}
                aria-label={t("trackDetail.copyPath")}
                title={t("trackDetail.copyPath")}
              >
                <Copy aria-hidden />
              </button>
            </div>
          ) : null}
        </section>

        <section className={detailBox()} aria-label={t("trackDetail.history")}>
          <h3 className={detailBoxTitle()}>{t("trackDetail.history")}</h3>
          <dl className={detailFacts()}>
            <dt className={detailFactLabel()}>{t("trackDetail.requestedAt")}</dt>
            <dd className={detailFactValue()}>{formatDateTime(new Date(track.created_at))}</dd>
            {track.completed_at ? (
              <>
                <dt className={detailFactLabel()}>{t("trackDetail.completedAt")}</dt>
                <dd className={detailFactValue()}>{formatDateTime(new Date(track.completed_at))}</dd>
              </>
            ) : null}
            {isFailed && track.watch_enabled && track.next_retry_at ? (
              <>
                <dt className={detailFactLabel()}>{t("trackDetail.nextTryAt")}</dt>
                <dd className={detailFactValue()}>{formatDateTime(new Date(track.next_retry_at))}</dd>
              </>
            ) : null}
            <dt className={detailFactLabel()}>{t("trackDetail.updatedAt")}</dt>
            <dd className={detailFactValue()}>{formatDateTime(new Date(track.updated_at))}</dd>
          </dl>
        </section>
      </div>

      {actions.length > 0 ? (
        <div className={detailActions()}>
          {actions.map((action) => (
            <TrackActionButton key={action.id} action={action} onAction={onAction} />
          ))}
        </div>
      ) : null}
      {lock !== null ? <p className={lockedReason()}>{t(`trackActions.lock.${lock}`)}</p> : null}
    </div>
  );
}
