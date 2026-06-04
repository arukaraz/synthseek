"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";

import { statusBadge, statusDot } from "../../styles";
import { SLSKD_STATUS_TONE } from "./constants";
import type { SlskdHealth, SlskdStatusBadgeProps } from "./types";

export function SlskdStatusBadge({ status, message, messageCode, messageParams }: SlskdStatusBadgeProps) {
  const { t } = useTranslation("settings");
  const { t: tHealth } = useTranslation("health");
  const tone = SLSKD_STATUS_TONE[status];

  const label: Record<SlskdHealth, string> = {
    healthy: t("slskd.status.healthy"),
    unhealthy: t("slskd.status.unhealthy"),
    not_configured: t("slskd.status.notConfigured"),
  };

  const supporting = messageCode ? tHealth(messageCode, messageParams) : message;

  return (
    <div className="flex flex-col gap-1">
      <span role="status" aria-live="polite" className={cn(statusBadge({ tone }))}>
        <span className={statusDot({ tone })} />
        {label[status]}
      </span>
      {supporting ? <p className="text-fg/55 text-xs">{supporting}</p> : null}
    </div>
  );
}
