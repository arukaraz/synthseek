"use client";

import { Check, Play, Square, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { HeldImportStatus } from "@api/__generated__/types";
import { TrackRetrySchedule } from "@components/TrackRetrySchedule";
import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { IconButton } from "@components/ui/IconButton";
import { useApproveHeldImport, useDiscardHeldImport } from "@hooks/api";
import { playerActions } from "@hooks/ui/player";
import { downloadSourceLabelKey } from "@utils/download-source";
import { formatBytes, formatRelativeTime } from "@utils/formatters";

import { evidenceSentence, heldAudioUrl, heldImportErrorKey } from "../helpers";
import {
  actionsRow,
  audioPlayer,
  errorNotice,
  evidenceText,
  filenameText,
  itemHeader,
  itemRow,
  itemTitle,
  metaRow,
} from "../styles";
import type { ReviewItemRowProps } from "../types";
import { ReviewReasonBadge } from "./ReviewReasonBadge";

export function ReviewItemRow({ item }: ReviewItemRowProps) {
  const { t } = useTranslation("requests");
  const { t: tSettings } = useTranslation("settings");
  const approve = useApproveHeldImport();
  const discard = useDiscardHeldImport();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const trackLabel = t("review.trackDisplay", { title: item.track.title, artist: item.track.artist });
  const sourceKey = downloadSourceLabelKey(item.source);
  const hasFailed = item.status === HeldImportStatus.enum.import_failed;
  const isBusy = item.status === HeldImportStatus.enum.importing || approve.isPending || discard.isPending;

  return (
    <li className={itemRow()} data-status={item.status}>
      <div className={itemHeader()}>
        <span className={itemTitle()} title={trackLabel}>
          {trackLabel}
        </span>
        <ReviewReasonBadge reason={item.reason} />
      </div>

      <p className={evidenceText()}>{evidenceSentence(item, t)}</p>

      <span className={filenameText()} title={item.originalFilename}>
        {item.originalFilename}
      </span>

      <div className={metaRow()}>
        <span title={t("review.columns.source")}>{sourceKey ? tSettings(sourceKey) : item.source}</span>
        {item.sourceUsername.length > 0 ? <span title={t("review.columns.peer")}>{item.sourceUsername}</span> : null}
        <span title={t("review.columns.size")}>{formatBytes(item.sizeBytes)}</span>
        <span title={t("review.columns.age")}>{formatRelativeTime(new Date(item.createdAt))}</span>
      </div>

      <TrackRetrySchedule nextRetryAt={item.track.nextRetryAt} retryCount={item.track.retryCount} />

      {hasFailed || item.error ? (
        <div className={errorNotice()}>
          {item.error ? <p>{t(heldImportErrorKey(item.error))}</p> : null}
          {hasFailed ? <p>{t("review.failedNotice")}</p> : null}
        </div>
      ) : null}

      <div className={actionsRow()}>
        {hasFailed ? null : (
          <IconButton
            icon={isPreviewOpen ? Square : Play}
            size="sm"
            aria-label={
              isPreviewOpen
                ? t("review.actions.stop", { name: trackLabel })
                : t("review.actions.play", { name: trackLabel })
            }
            aria-pressed={isPreviewOpen}
            onClick={() => setIsPreviewOpen((open) => !open)}
          />
        )}
        {hasFailed ? null : (
          <Button size="sm" disabled={isBusy} onClick={() => approve.mutate({ id: item.id })}>
            <Check />
            {t("review.actions.approve")}
          </Button>
        )}
        <Button variant="ghost" size="sm" disabled={isBusy} onClick={() => setIsConfirmOpen(true)}>
          <Trash2 />
          {t("review.actions.discard")}
        </Button>
      </div>

      {isPreviewOpen && !hasFailed ? (
        <audio
          controls
          className={audioPlayer()}
          src={heldAudioUrl(item.id)}
          onPlay={playerActions.pauseForOtherAudio}
          aria-label={t("review.actions.previewLabel", { name: trackLabel })}
        />
      ) : null}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => discard.mutate({ id: item.id })}
        title={t("review.confirmDiscard.title")}
        message={t("review.confirmDiscard.message")}
        confirmText={t("review.confirmDiscard.confirm")}
        variant="danger"
      />
    </li>
  );
}
