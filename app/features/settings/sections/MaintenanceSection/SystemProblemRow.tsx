"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { problemCopyParams } from "./helpers";
import { problemBody, problemEffect, problemFix, problemIcon, problemRow, problemTitle } from "./styles";
import type { SystemProblemRowProps } from "./types";

export function SystemProblemRow({ problem }: SystemProblemRowProps) {
  const { t } = useTranslation("settings");
  const params = problemCopyParams(problem);

  return (
    <li className={problemRow()}>
      <TriangleAlert className={problemIcon()} aria-hidden />
      <div className={problemBody()}>
        <h2 className={problemTitle()}>{t(`maintenance.systemStatus.problems.${problem.kind}.title`)}</h2>
        <p className={problemEffect()}>{t(`maintenance.systemStatus.problems.${problem.kind}.effect`, params)}</p>
        <p className={problemFix()}>{t(`maintenance.systemStatus.problems.${problem.kind}.fix`, params)}</p>
      </div>
    </li>
  );
}
