"use client";

import { RequestStatus } from "@api/__generated__/types";
import { TrackStatusIcon } from "@components/TrackStatusIndicator";
import { useTranslation } from "react-i18next";

import { trackGroupOf } from "./helpers";
import {
  detailHead,
  detailHeadBody,
  detailHeadIcon,
  detailHeadText,
  detailHeadTitle,
  detailProgress,
  detailProgressFill,
  detailRawError,
  detailRawErrorSummary,
  trackStatusPercent,
} from "./styles";
import { TrackRetryLine } from "./TrackRetryLine";
import type { TrackDetailHeadProps } from "./types";

export function TrackDetailHead({ track, release, showRawError }: TrackDetailHeadProps) {
  const { t } = useTranslation(["requests", "status"]);
  const group = trackGroupOf(track);

  if (track.status === RequestStatus.enum.failed) {
    const reason = track.failure_reason;
    return (
      <div className={detailHead({ tone: "failed" })}>
        <span className={detailHeadIcon()}>
          <TrackStatusIcon status={track.status} />
        </span>
        <div className={detailHeadBody()}>
          <p className={detailHeadTitle()}>
            {reason ? t(`status:failureReason.${reason}.label`) : t("status:request.failed.label")}
          </p>
          <p className={detailHeadText()}>
            {reason ? t(`status:failureReason.${reason}.description`) : t("status:request.failed.description")}
          </p>
          <TrackRetryLine track={track} />
          {showRawError && track.error ? (
            <details>
              <summary className={detailRawErrorSummary()}>{t("trackDetail.rawError")}</summary>
              <pre className={detailRawError()}>{track.error}</pre>
            </details>
          ) : null}
        </div>
      </div>
    );
  }

  if (track.status === RequestStatus.enum.downloading && release?.state === "queued") {
    return (
      <div className={detailHead({ tone: "neutral" })}>
        <span className={detailHeadIcon()}>
          <TrackStatusIcon status={RequestStatus.enum.pending_download} />
        </span>
        <div className={detailHeadBody()}>
          <p className={detailHeadTitle()}>{t("status:request.pending_download.label")}</p>
          <p className={detailHeadText()}>{t("status:request.pending_download.description")}</p>
        </div>
      </div>
    );
  }

  if (track.status === RequestStatus.enum.downloading) {
    const percent = release?.state === "fetching" ? release.percent : track.progress;
    return (
      <div className={detailHead({ tone: "active" })}>
        <span className={detailHeadIcon()}>
          <TrackStatusIcon status={track.status} />
        </span>
        <div className={detailHeadBody()}>
          <p className={detailHeadTitle()}>{t("status:request.downloading.label")}</p>
          <div
            className={detailProgress()}
            role="progressbar"
            aria-label={t("status:request.downloading.label")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className={detailProgressFill()} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <span className={trackStatusPercent()}>{percent}%</span>
      </div>
    );
  }

  if (group === "cancelled" || group === "review") {
    return (
      <div className={detailHead({ tone: "neutral" })}>
        <span className={detailHeadIcon()}>
          <TrackStatusIcon status={track.status} />
        </span>
        <div className={detailHeadBody()}>
          <p className={detailHeadTitle()}>{t(`status:request.${track.status}.label`)}</p>
          <p className={detailHeadText()}>
            {group === "cancelled" ? t("trackDetail.cancelledHint") : t(`status:request.${track.status}.description`)}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
