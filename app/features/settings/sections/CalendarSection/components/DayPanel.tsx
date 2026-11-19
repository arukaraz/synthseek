"use client";

import { useTranslation } from "react-i18next";

import { fullDateLabel } from "../helpers";
import { dayPanel, dayPanelTitle, hintText } from "../styles";
import { ReleaseCards } from "./ReleaseCards";
import type { DayPanelProps } from "./types";

export function DayPanel({ iso, releaseId, releases, today, showTitle = true }: DayPanelProps) {
  const { t } = useTranslation("follows");
  const shown = releaseId === null ? releases : releases.filter((release) => release.releaseId === releaseId);

  return (
    <div className={dayPanel()}>
      {showTitle ? <h3 className={dayPanelTitle()}>{t("releases.dayTitle", { date: fullDateLabel(iso) })}</h3> : null}
      {shown.length === 0 ? (
        <p className={hintText()}>{t("releases.noneOnDay")}</p>
      ) : (
        <ReleaseCards releases={shown} today={today} />
      )}
    </div>
  );
}
