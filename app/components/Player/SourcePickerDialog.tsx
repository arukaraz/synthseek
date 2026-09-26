"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { settleSourcePick, sourceLabelFor } from "@hooks/ui/player";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SourceOptions } from "./SourceOptions";
import { pickerFill } from "./styles";
import type { SourcePickerDialogProps } from "./types";

export function SourcePickerDialog({ request }: SourcePickerDialogProps) {
  const { t } = useTranslation("player");
  const [selected, setSelected] = useState(request.counts[0]?.key ?? null);
  const [fillFromNext, setFillFromNext] = useState(true);
  const options = request.counts.map((entry) => ({
    key: entry.key,
    label: sourceLabelFor(entry.key, t("source.local")),
    detail: t("sourcePicker.count", { count: entry.count, total: request.total }),
  }));

  return (
    <ConfirmationModal
      isOpen
      variant="info"
      title={t("sourcePicker.title")}
      message={t("sourcePicker.message")}
      confirmText={t("sourcePicker.play")}
      onConfirm={() => settleSourcePick(selected === null ? null : { source: selected, fillFromNext })}
      onClose={() => settleSourcePick(null)}
    >
      <SourceOptions options={options} selected={selected} label={t("sourcePicker.title")} onSelect={setSelected} />
      <label className={pickerFill()}>
        <Checkbox checked={fillFromNext} onCheckedChange={(value) => setFillFromNext(value === true)} />
        <span>{t("sourcePicker.fillFromNext")}</span>
      </label>
    </ConfirmationModal>
  );
}
