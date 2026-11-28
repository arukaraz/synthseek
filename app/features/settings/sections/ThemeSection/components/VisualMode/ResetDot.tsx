"use client";

import { RotateCcw } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

import { resetButton, resetGlyph, unsavedGlyph } from "./styles";
import type { ResetDotProps } from "./types";

export function ResetDot({ token, label, baseLabel, presetName, changed, unsaved, onReset }: ResetDotProps) {
  const { t } = useTranslation("themeEditor");
  const following = token.follows !== undefined;
  const resetTitle = following
    ? t("visual.followAgain", { base: baseLabel ?? token.follows })
    : t("visual.backToPreset", { preset: presetName });
  const name = following ? resetTitle : t("visual.reset", { token: label });
  const noteId = useId();

  return (
    <button
      type="button"
      className={resetButton({ shown: changed || unsaved })}
      title={changed ? resetTitle : undefined}
      aria-label={name}
      aria-describedby={unsaved ? noteId : undefined}
      disabled={!changed}
      onClick={() => onReset(token.name)}
    >
      {unsaved ? (
        <>
          <span className={unsavedGlyph()} aria-hidden />
          <span id={noteId} className="sr-only">
            {t("bar.unsaved")}
          </span>
        </>
      ) : (
        <RotateCcw className={resetGlyph()} aria-hidden />
      )}
    </button>
  );
}
