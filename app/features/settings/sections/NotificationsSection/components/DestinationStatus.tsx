"use client";

import { useTranslation } from "react-i18next";

import { formatRelativeTime } from "@utils/formatters";

import { statusLine } from "../styles";
import type { DestinationStatusProps } from "../types";

export function DestinationStatus({ destination }: DestinationStatusProps) {
  const { t } = useTranslation("settings");

  if (!destination?.configured) return <p className={statusLine()}>{t("notifications.status.notConfigured")}</p>;

  if (destination.lastFailure !== null) {
    const reason = t(`notifications.failures.${destination.lastFailure}`);
    return (
      <p className={statusLine({ tone: "warning" })} role="status">
        {destination.lastFailureCode === null
          ? t("notifications.status.failed", { reason })
          : t("notifications.status.failedWithCode", { reason, code: destination.lastFailureCode })}
      </p>
    );
  }

  if (destination.lastDeliveredAt !== null) {
    return (
      <p className={statusLine({ tone: "ok" })}>
        {t("notifications.status.delivered", { when: formatRelativeTime(destination.lastDeliveredAt) })}
      </p>
    );
  }

  return <p className={statusLine()}>{t("notifications.status.neverDelivered")}</p>;
}
