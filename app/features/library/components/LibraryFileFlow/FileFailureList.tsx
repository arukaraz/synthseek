"use client";

import { useTranslation } from "react-i18next";

import { FAILURE_PREVIEW_LIMIT, FAILURE_REASON_KEYS } from "./constants";
import { failureList, failureMore } from "./styles";
import type { FileFailureListProps } from "./types";

export function FileFailureList({ failures, failedCount }: FileFailureListProps) {
  const { t } = useTranslation("library");
  const shown = failures.slice(0, FAILURE_PREVIEW_LIMIT);
  const more = failedCount - shown.length;

  return (
    <ul className={failureList()}>
      {shown.map((failure, index) => (
        <li key={`${failure.title}-${index}`}>
          {t("files.failure.item", { title: failure.title, reason: t(FAILURE_REASON_KEYS[failure.reason]) })}
        </li>
      ))}
      {more > 0 ? <li className={failureMore()}>{t("files.failure.more", { count: more })}</li> : null}
    </ul>
  );
}
