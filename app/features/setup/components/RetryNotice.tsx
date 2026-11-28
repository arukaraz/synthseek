"use client";

import { useTranslation } from "react-i18next";

import { clockOf, spokenDurationOf } from "@features/auth/helpers";
import { useCountdown } from "@hooks/ui/useCountdown";

import type { RetryNoticeProps } from "../types";
import { StatusStrip } from "./StatusStrip";

export function RetryNotice({ deadline, retryAfterSeconds }: RetryNoticeProps) {
  const { t, i18n } = useTranslation("setup");
  const remaining = useCountdown(deadline);

  return (
    <StatusStrip
      tone="error"
      message={
        <>
          <span className="sr-only">
            {t("account.throttled.announce", { duration: spokenDurationOf(retryAfterSeconds, i18n.language) })}
          </span>
          <span aria-hidden="true">{t("account.throttled.visible", { time: clockOf(remaining) })}</span>
        </>
      }
    />
  );
}
