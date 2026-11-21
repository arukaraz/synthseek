"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SelectMenu } from "@components/ui/SelectMenu";

import { fontChoicesOf } from "./helpers";
import { ResetDot } from "./ResetDot";
import { fontRow, fontSelectCell, meta, metaHint, metaName } from "./styles";
import type { FontRowProps } from "./types";

export function FontRow({
  token,
  label,
  hint,
  value,
  families,
  changed,
  presetName,
  baseLabel,
  onWrite,
  onReset,
}: FontRowProps) {
  const { t } = useTranslation("themeEditor");
  const choices = useMemo(
    () => fontChoicesOf(token.name, families, (key) => t(`fonts.${key}`)),
    [token.name, families, t]
  );
  const options = choices.some((choice) => choice.value === value)
    ? choices
    : [...choices, { value, label: t("visual.customOption") }];

  return (
    <div className={fontRow()} data-token={token.name}>
      <div className={meta()}>
        <span className={metaName()}>{label}</span>
        <span className={metaHint()} title={hint}>
          {hint}
        </span>
      </div>
      <div className={fontSelectCell()}>
        <SelectMenu value={value} options={options} onChange={(next) => onWrite(token.name, next)} ariaLabel={label} />
      </div>
      <ResetDot
        token={token}
        label={label}
        baseLabel={baseLabel}
        presetName={presetName}
        changed={changed}
        onReset={onReset}
      />
    </div>
  );
}
