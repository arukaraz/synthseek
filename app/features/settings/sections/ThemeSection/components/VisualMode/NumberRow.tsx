"use client";

import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { plainNumber, unitOf } from "./helpers";
import { ResetDot } from "./ResetDot";
import {
  customNumber,
  customText,
  linkButton,
  meta,
  metaHint,
  metaName,
  rangeInput,
  rangeRow,
  rangeValue,
} from "./styles";
import type { RangeRowProps } from "./types";

export function NumberRow({
  token,
  label,
  hint,
  value,
  changed,
  unsaved,
  presetName,
  baseLabel,
  onWrite,
  onReset,
  onEditInCss,
}: RangeRowProps) {
  const { t } = useTranslation("themeEditor");
  const unit = unitOf(token);
  const plain = plainNumber(value, unit);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    onWrite(token.name, `${event.target.value}${unit}`);
  };

  return (
    <div className={rangeRow()} data-token={token.name}>
      <div className={meta()}>
        <span className={metaName()}>{label}</span>
        <span className={metaHint()} title={hint}>
          {hint}
        </span>
      </div>
      {plain !== null ? (
        <>
          <input
            type="range"
            className={rangeInput()}
            min={token.min}
            max={token.max}
            step={token.step}
            value={plain}
            aria-label={label}
            aria-valuetext={value}
            onChange={handleInput}
          />
          <span className={rangeValue()}>{value}</span>
        </>
      ) : (
        <div className={customNumber()}>
          <span className={customText()}>{t("visual.customNumber")}</span>
          <button type="button" className={linkButton()} onClick={() => onEditInCss(token.file)}>
            {t("visual.customValue")}
          </button>
        </div>
      )}
      <ResetDot
        token={token}
        label={label}
        baseLabel={baseLabel}
        presetName={presetName}
        changed={changed}
        unsaved={unsaved}
        onReset={onReset}
      />
    </div>
  );
}
