"use client";

import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useCountdown } from "@hooks/ui/useCountdown";

import { clockOf, spokenDurationOf } from "../helpers";
import { signInNotice, signInNoticeBody, signInNoticeGlyph } from "../styles";
import type { ThrottleNoticeProps } from "../types";

export function ThrottleNotice({ deadline, retryAfterSeconds }: ThrottleNoticeProps) {
  const { t, i18n } = useTranslation("auth");
  const remaining = useCountdown(deadline);

  return (
    <div className={signInNotice({ tone: "error" })}>
      <CircleAlert aria-hidden="true" className={signInNoticeGlyph()} />
      <span className={signInNoticeBody()}>
        <span role="alert" className="sr-only">
          {t("auth.login.throttled.announce", { duration: spokenDurationOf(retryAfterSeconds, i18n.language) })}
        </span>
        <span aria-hidden="true">{t("auth.login.throttled.visible", { time: clockOf(remaining) })}</span>
      </span>
    </div>
  );
}
