"use client";

import { useTranslation } from "react-i18next";

import { jobDescription, jobInfo, jobName, jobRow } from "../../styles";
import type { OrganiseGroupRowProps } from "./types";

export function OrganiseGroupRow({ moveClass, count, checked, disabled, onToggle }: OrganiseGroupRowProps) {
  const { t } = useTranslation("settings");

  return (
    <label className={jobRow()}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled || count === 0}
        onChange={(event) => onToggle(event.target.checked)}
        className="accent-accent size-4 shrink-0"
      />
      <span className={jobInfo()}>
        <span className={jobName()}>{t(`libraryOrganise.groups.${moveClass}.title`)}</span>
        <span className={jobDescription()}>{t(`libraryOrganise.groups.${moveClass}.description`)}</span>
      </span>
      <span className="text-fg ml-auto shrink-0 text-sm font-medium tabular-nums">{count.toLocaleString()}</span>
    </label>
  );
}
