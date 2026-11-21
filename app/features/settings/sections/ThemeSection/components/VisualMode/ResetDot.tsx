"use client";

import { useTranslation } from "react-i18next";

import { resetButton, resetGlyph } from "./styles";
import type { ResetDotProps } from "./types";

export function ResetDot({ token, label, baseLabel, presetName, changed, onReset }: ResetDotProps) {
  const { t } = useTranslation("themeEditor");
  const following = token.follows !== undefined;
  const title = following
    ? t("visual.followAgain", { base: baseLabel ?? token.follows })
    : t("visual.backToPreset", { preset: presetName });
  const name = following ? title : t("visual.reset", { token: label });

  return (
    <button
      type="button"
      className={resetButton()}
      title={title}
      aria-label={name}
      disabled={!changed}
      onClick={() => onReset(token.name)}
    >
      <span className={resetGlyph()} aria-hidden />
    </button>
  );
}
