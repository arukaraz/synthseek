"use client";

import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { useTranslation } from "react-i18next";

import { statusDotClass, statusDotTone } from "./helpers";
import { cardStatusDot, cardStatusIcon } from "./styles";
import type { CardStatusDotProps } from "./types";

export function CardStatusDot({ status }: CardStatusDotProps) {
  const { t } = useTranslation("status");
  const label = t(`request.${status}.label`);
  const StatusIcon = REQUEST_STATUS_CONFIG[status].icon;

  return (
    <>
      <span
        role="img"
        aria-label={label}
        title={label}
        data-status-dot={statusDotTone(status)}
        className={cn(cardStatusDot(), statusDotClass(status))}
      />
      <StatusIcon aria-hidden className={cardStatusIcon()} />
    </>
  );
}
