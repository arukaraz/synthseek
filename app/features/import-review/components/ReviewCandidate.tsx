"use client";

import { Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { HeldImportStatus } from "@api/__generated__/types";
import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { PreviewButton } from "@components/ui/PreviewButton";
import { useApproveHeldImport, useDiscardHeldImport } from "@hooks/api";
import { enqueueReviewApproval } from "@hooks/api/subscriptions";
import { useTrackPreview } from "@hooks/ui/trackPreview";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { formatBytes, formatRelativeTime } from "@utils/formatters";

import { heldFileClip, heldImportErrorKey } from "../helpers";
import {
  actionsRow,
  approveNarrow,
  approveSub,
  approveWide,
  candidateBlock,
  candidateHeader,
  candidateIndex,
  candidateMeta,
  discardButton,
  errorNotice,
  filenameText,
} from "../styles";
import type { ReviewCandidateProps } from "../types";
import { ReviewCompareTable } from "./ReviewCompareTable";
import { ReviewReasonBadge } from "./ReviewReasonBadge";

export function ReviewCandidate({ item, index, siblings, onListen }: ReviewCandidateProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const approve = useApproveHeldImport();
  const discard = useDiscardHeldImport();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const trackLabel = t("review.trackDisplay", { title: item.track.title, artist: item.track.artist });
  const audition = useTrackPreview(heldFileClip(item.id, trackLabel));
  const hasFailed = item.status === HeldImportStatus.enum.import_failed;
  const isBusy = item.status === HeldImportStatus.enum.importing || approve.isPending || discard.isPending;

  const handleApprove = () => {
    enqueueReviewApproval({ key: item.id, name: trackLabel });
    approve.mutate({ id: item.id });
  };

  return (
    <section
      className={candidateBlock()}
      data-status={item.status}
      aria-label={t("review.candidate.index", { index: index + 1 })}
    >
      <div className={candidateHeader()}>
        {hasFailed ? null : (
          <PreviewButton
            title={trackLabel}
            subject="file"
            status={audition.status}
            clock={audition.clock}
            available
            onToggle={() => {
              onListen(item.id);
              audition.toggle();
            }}
          />
        )}
        <span className={candidateMeta()}>
          {siblings > 0 ? (
            <>
              <strong className={candidateIndex()}>{t("review.candidate.index", { index: index + 1 })}</strong>
              {" · "}
            </>
          ) : null}
          <span title={t("review.columns.source")}>{sourceLabel(item.source)}</span>
          {item.sourceUsername.length > 0 ? (
            <>
              {" · "}
              <span title={t("review.columns.peer")}>{item.sourceUsername}</span>
            </>
          ) : null}
          {" · "}
          <span title={t("review.columns.size")}>{formatBytes(item.sizeBytes)}</span>
          {" · "}
          <span title={t("review.columns.age")}>
            {t("review.candidate.held", { age: formatRelativeTime(new Date(item.createdAt)) })}
          </span>
        </span>
        <ReviewReasonBadge reason={item.reason} />
      </div>

      <ReviewCompareTable item={item} />

      <span className={filenameText()} title={item.originalFilename}>
        {item.originalFilename}
      </span>

      {hasFailed || item.error ? (
        <div className={errorNotice()}>
          {item.error ? <p>{t(heldImportErrorKey(item.error))}</p> : null}
          {hasFailed ? <p>{t("review.failedNotice")}</p> : null}
        </div>
      ) : null}

      <div className={actionsRow()}>
        <Button
          variant="ghost"
          size="sm"
          className={discardButton()}
          disabled={isBusy}
          onClick={() => setIsConfirmOpen(true)}
        >
          <Trash2 />
          {t("review.actions.discard")}
        </Button>
        {hasFailed ? null : (
          <Button size="sm" disabled={isBusy} onClick={handleApprove}>
            <Check />
            {siblings > 0 ? (
              <>
                <span className={approveNarrow()}>{t("review.actions.approve")}</span>
                <span className={approveWide()}>{t("review.actions.approveThisFile")}</span>
                <span className={approveSub()}>{t("review.actions.discardsOthers", { count: siblings })}</span>
              </>
            ) : (
              t("review.actions.approve")
            )}
          </Button>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => discard.mutate({ id: item.id })}
        title={t("review.confirmDiscard.title", { name: item.track.title })}
        message={
          siblings > 0
            ? t("review.confirmDiscard.messageSiblings", { count: siblings })
            : t("review.confirmDiscard.message")
        }
        confirmText={t("review.confirmDiscard.confirm")}
        variant="danger"
      />
    </section>
  );
}
