"use client";

import { useTranslation } from "react-i18next";

import { chip, codeHead, codePath } from "../styles";
import type { EditorHeadProps } from "../types";

export function EditorHead({ path, side, onSide }: EditorHeadProps) {
  const { t } = useTranslation("themeEditor");
  return (
    <div className={codeHead()}>
      <code className={codePath()}>{path}</code>
      <button
        type="button"
        aria-pressed={side === "insert"}
        className={chip({ pressed: side === "insert" })}
        onClick={() => onSide(side === "insert" ? null : "insert")}
      >
        {t("css.insert")}
      </button>
      <button
        type="button"
        aria-pressed={side === "history"}
        className={chip({ pressed: side === "history" })}
        onClick={() => onSide(side === "history" ? null : "history")}
      >
        {t("css.history")}
      </button>
    </div>
  );
}
