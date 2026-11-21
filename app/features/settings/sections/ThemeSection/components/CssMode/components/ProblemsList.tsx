"use client";

import { useTranslation } from "react-i18next";

import { MAX_PROBLEMS_SHOWN } from "../constants";
import { problemButton, problemLine, problemMore, problemsBox } from "../styles";
import type { ProblemsListProps } from "../types";

export function ProblemsList({ diagnostics, describe, onGoTo }: ProblemsListProps) {
  const { t } = useTranslation("themeEditor");
  if (diagnostics.length === 0) return null;
  const rest = diagnostics.length - MAX_PROBLEMS_SHOWN;
  return (
    <div className={problemsBox()}>
      {diagnostics.slice(0, MAX_PROBLEMS_SHOWN).map((diagnostic, index) => (
        <button
          key={`${diagnostic.line}:${diagnostic.column}:${diagnostic.code}:${index}`}
          type="button"
          className={problemButton()}
          onClick={() => onGoTo(diagnostic)}
        >
          <span className={problemLine({ severity: diagnostic.severity })}>
            {t("css.line", { line: diagnostic.line })}
          </span>{" "}
          <span>{describe(diagnostic)}</span>
        </button>
      ))}
      {rest > 0 ? <span className={problemMore()}>{t("css.more", { count: rest })}</span> : null}
    </div>
  );
}
