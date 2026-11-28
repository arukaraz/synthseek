"use client";

import { useTranslation } from "react-i18next";

import { controlHelp, controlLabel, controlRow, controlSlot, controlText } from "./styles";
import type { ControlRowProps } from "./types";

export function ControlRow({ definition, descriptionId, children }: ControlRowProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={controlRow()} data-anchor-target={definition.anchor}>
      <div className={controlText()}>
        <span className={controlLabel()}>{t(definition.labelKey)}</span>
        <span id={descriptionId} className={controlHelp()}>
          {t(definition.descriptionKey)}
        </span>
      </div>
      <div className={controlSlot()}>{children}</div>
    </div>
  );
}
