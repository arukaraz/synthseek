"use client";

import { useTranslation } from "react-i18next";

import { WIDGET_KIND_ICONS, WIDGET_KINDS } from "./constants";
import { kindTab, kindTabs, kindTabsFill } from "./styles";
import type { WorkshopKindTabsProps } from "./types";

export function WorkshopKindTabs({ kind, panelId, onChange }: WorkshopKindTabsProps) {
  const { t } = useTranslation("widgets");

  return (
    <div className={kindTabs()} role="tablist" aria-label={t("workshop.kindLabel")}>
      {WIDGET_KINDS.map((option) => {
        const Icon = WIDGET_KIND_ICONS[option];
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={option === kind}
            aria-controls={panelId}
            className={kindTab({ active: option === kind })}
            onClick={() => onChange(option)}
          >
            <Icon aria-hidden />
            {t(`kinds.${option}`)}
          </button>
        );
      })}
      <span className={kindTabsFill()} aria-hidden />
    </div>
  );
}
