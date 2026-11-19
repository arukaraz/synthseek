"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useNow } from "@hooks/ui/useNow";

import { formatRelativeTime } from "@utils/formatters";

import { lastChecked } from "../styles";
import type { LastCheckedProps } from "./types";

export function LastChecked({ lastCheckedAt }: LastCheckedProps) {
  const { t } = useTranslation("follows");
  useNow();

  return (
    <p className={lastChecked()}>
      {lastCheckedAt === null
        ? t("releases.notChecked")
        : t("releases.checked", { time: formatRelativeTime(lastCheckedAt) })}
      <InfoTooltip description={t("releases.checkInfo")} />
    </p>
  );
}
