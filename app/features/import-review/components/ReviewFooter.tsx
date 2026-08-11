"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { useUpdateEngineReview } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useSettings } from "@hooks/api/queries/useSettings";
import { formatBytes } from "@utils/formatters";

import { RETENTION_ERROR_ID, RETENTION_INPUT_ID, RETENTION_MAX_DAYS, RETENTION_MIN_DAYS } from "../constants";
import { parseRetentionDays } from "../helpers";
import { footerSummary, footerWrap, retentionError, retentionInput, retentionLabel, retentionWrap } from "../styles";
import type { ReviewFooterProps } from "../types";

export function ReviewFooter({ totalCount, totalBytes }: ReviewFooterProps) {
  const { t } = useTranslation("requests");
  const settings = useSettings();
  const update = useUpdateEngineReview();
  const [draft, setDraft] = useState<string | null>(null);

  const stored = settings.data?.engine.review;
  const value = draft ?? (stored === undefined ? "" : String(stored.retentionDays));
  const retentionDays = parseRetentionDays(value);
  const isInvalid = retentionDays === null;
  const isDirty = stored !== undefined && retentionDays !== stored.retentionDays;

  const handleSave = () => {
    if (stored === undefined || retentionDays === null) return;
    update.mutate({ ...stored, retentionDays });
  };

  return (
    <div className={footerWrap()}>
      <span className={footerSummary()}>
        {t("review.footer.summary", { count: totalCount, size: formatBytes(totalBytes) })}
      </span>

      {stored ? (
        <div className={retentionWrap()}>
          <label className={retentionLabel()} htmlFor={RETENTION_INPUT_ID}>
            {t("review.footer.retention.label")}
          </label>
          <Input
            id={RETENTION_INPUT_ID}
            type="number"
            inputMode="numeric"
            className={retentionInput()}
            min={RETENTION_MIN_DAYS}
            max={RETENTION_MAX_DAYS}
            value={value}
            disabled={update.isPending}
            aria-invalid={isInvalid}
            aria-describedby={isInvalid ? RETENTION_ERROR_ID : undefined}
            onChange={(event) => setDraft(event.target.value)}
          />
          <span className={retentionLabel()}>{t("review.footer.retention.suffix")}</span>
          {isInvalid ? (
            <span id={RETENTION_ERROR_ID} role="alert" className={retentionError()}>
              {t("review.footer.retention.range", { min: RETENTION_MIN_DAYS, max: RETENTION_MAX_DAYS })}
            </span>
          ) : null}
          {isDirty ? (
            <Button size="sm" disabled={update.isPending || isInvalid} onClick={handleSave}>
              {update.isPending ? t("review.footer.retention.saving") : t("review.footer.retention.save")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
