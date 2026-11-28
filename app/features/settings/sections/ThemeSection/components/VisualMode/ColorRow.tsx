"use client";

import { formatOklch, fromHex, parseColor, toHex } from "@theme/custom";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { contrastOf, formatRatio, isLowContrast, percentOf } from "./helpers";
import { ResetDot } from "./ResetDot";
import {
  colorRow,
  contrastBadge,
  linkButton,
  meta,
  metaHint,
  metaName,
  swatch,
  swatchFill,
  swatchInput,
  valueText,
} from "./styles";
import type { ColorRowProps } from "./types";

export function ColorRow({
  token,
  label,
  hint,
  value,
  other,
  warning,
  following,
  changed,
  unsaved,
  presetName,
  baseLabel,
  onWrite,
  onReset,
  onEditInCss,
}: ColorRowProps) {
  const { t } = useTranslation("themeEditor");
  const color = parseColor(value);
  const ratio = contrastOf(value, other);
  const hintText =
    token.follows !== undefined && baseLabel !== null
      ? following
        ? t("visual.follows", { base: baseLabel })
        : t("visual.setByHand", { hint })
      : hint;

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (color === null) return;
    const picked = fromHex(event.target.value);
    if (picked === null) return;
    onWrite(token.name, formatOklch({ ...picked, alpha: color.alpha }));
  };

  return (
    <div className={colorRow()} data-token={token.name}>
      <label className={swatch()} title={token.name}>
        <span className={swatchFill()} style={{ background: value }} />
        {color !== null ? (
          <input
            type="color"
            className={swatchInput()}
            value={toHex(color)}
            aria-label={label}
            onChange={handleInput}
          />
        ) : null}
      </label>
      <div className={meta()}>
        <span className={metaName()}>{label}</span>
        {warning !== null ? (
          <span className={metaHint({ warn: true })}>{warning}</span>
        ) : (
          <span className={metaHint()} title={hintText}>
            {hintText}
          </span>
        )}
      </div>
      {color !== null ? (
        <code className={valueText()}>
          {toHex(color)}
          {color.alpha < 1 ? ` ${t("visual.opacity", { percent: percentOf(color.alpha) })}` : ""}
        </code>
      ) : (
        <button type="button" className={linkButton()} onClick={() => onEditInCss(token.file)}>
          {t("visual.customValue")}
        </button>
      )}
      {ratio !== null ? (
        <span className={contrastBadge({ low: isLowContrast(ratio) })} title={t("visual.contrast")}>
          {formatRatio(ratio)}
        </span>
      ) : (
        <span />
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
