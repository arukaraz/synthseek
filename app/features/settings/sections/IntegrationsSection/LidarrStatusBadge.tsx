"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";

import { statusBadge, statusDot } from "../../styles";
import { LIDARR_STATUS_TONE } from "./constants";
import type { LidarrHealth, LidarrStatusBadgeProps } from "./types";

export function LidarrStatusBadge({ status, message, messageCode, messageParams }: LidarrStatusBadgeProps) {
  const { t } = useTranslation("settings");
  const { t: tHealth } = useTranslation("health");
  const tone = LIDARR_STATUS_TONE[status];

  const label: Record<LidarrHealth, string> = {
    healthy: t("lidarr.status.healthy"),
    unhealthy: t("lidarr.status.unhealthy"),
    not_configured: t("lidarr.status.notConfigured"),
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
