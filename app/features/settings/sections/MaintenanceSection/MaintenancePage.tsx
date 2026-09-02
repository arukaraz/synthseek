"use client";

import { useTranslation } from "react-i18next";

import { cardDescription, cardTitle, contentRoot, settingsCard } from "../../styles";
import type { MaintenancePageProps } from "./types";

export function MaintenancePage({ surface, children }: MaintenancePageProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={contentRoot()}>
      <div className="flex flex-col gap-1">
        <h1 className={cardTitle()}>{t(`maintenance.${surface}.title`)}</h1>
        <p className={cardDescription()}>{t(`maintenance.${surface}.description`)}</p>
      </div>
      <div className={settingsCard()}>{children}</div>
    </div>
  );
}
