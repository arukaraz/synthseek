"use client";

import { useTranslation } from "react-i18next";

import { REJECTED_REASON_KEYS } from "../constants";
import { rejectedName, rejectedPanel, rejectedReason, rejectedRow, sectionHeader } from "../styles";
import type { RejectedFilesListProps } from "../types";

export function RejectedFilesList({ entries }: RejectedFilesListProps) {
  const { t } = useTranslation("library");

  if (entries.length === 0) return null;

  return (
    <div className={rejectedPanel()}>
      <span className={sectionHeader()}>{t("dropImport.rejected.title", { count: entries.length })}</span>
      <ul className="flex flex-col gap-0.5">
        {entries.map((entry, index) => (
          <li key={`${entry.name}-${index}`} className={rejectedRow()}>
            <span className={rejectedName()} title={entry.name}>
              {entry.name}
            </span>
            <span className={rejectedReason()}>{t(REJECTED_REASON_KEYS[entry.reason])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
