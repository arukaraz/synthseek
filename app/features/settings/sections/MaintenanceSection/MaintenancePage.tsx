"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";

import { cardDescription, cardTitle, settingsCard } from "../../styles";
import { maintenanceHeader, maintenanceTitle } from "./styles";
import type { MaintenancePageProps } from "./types";

export function MaintenancePage({ surface, descriptionAsTooltip = false, children }: MaintenancePageProps) {
  const { t } = useTranslation("settings");
  const description = t(`maintenance.${surface}.description`);

  return (
    <>
      <div className={maintenanceHeader()}>
        <h2 className={maintenanceTitle()}>
          <span className={cardTitle()}>{t(`maintenance.${surface}.title`)}</span>
          {descriptionAsTooltip ? <InfoTooltip description={description} /> : null}
        </h2>
        {descriptionAsTooltip ? null : <p className={cardDescription()}>{description}</p>}
      </div>
      <div className={settingsCard()}>{children}</div>
    </>
  );
}
