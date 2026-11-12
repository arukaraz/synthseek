"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useClearListeningHistory } from "@hooks/api";

import { DEFAULT_HISTORY_RANGE, HISTORY_RANGE_KEYS } from "../constants";
import { historyRanges } from "../helpers";
import { rangeCount, rangeList, rangeOption } from "../styles";
import type { ClearHistoryDialogProps, HistoryRange } from "../types";

export function ClearHistoryDialog({ open, history, onClose }: ClearHistoryDialogProps) {
  const { t } = useTranslation("settings");
  const clear = useClearListeningHistory();
  const [range, setRange] = useState<HistoryRange>(DEFAULT_HISTORY_RANGE);

  return (
    <ConfirmationModal
      isOpen={open}
      onClose={onClose}
      onConfirm={() => clear.mutate({ range })}
      title={t("privacy.history.clear.label")}
      message={t("privacy.history.clear.description")}
      confirmText={t("privacy.history.clear.confirm")}
      variant="danger"
    >
      <div role="radiogroup" aria-label={t("privacy.history.clear.rangeLabel")} className={rangeList()}>
        {historyRanges().map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={range === option}
            className={rangeOption({ active: range === option })}
            onClick={() => setRange(option)}
          >
            <span>{t(HISTORY_RANGE_KEYS[option])}</span>
            <span className={rangeCount()}>{t("privacy.history.clear.count", { count: history[option] })}</span>
          </button>
        ))}
      </div>
    </ConfirmationModal>
  );
}
