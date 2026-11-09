"use client";

import { useTranslation } from "react-i18next";

import { PHONE_PANE_ICONS, PHONE_PANE_KEYS, PHONE_PANES } from "./constants";
import { customizationTabBar, customizationTabBarLabel, customizationTabBarTab } from "./styles";
import type { CustomizationTabBarProps } from "./types";

export function CustomizationTabBar({ value, onValueChange }: CustomizationTabBarProps) {
  const { t } = useTranslation(["widgets"]);

  return (
    <div role="tablist" aria-label={t("board.customization.sections.label")} className={customizationTabBar()}>
      {PHONE_PANES.map((pane) => {
        const Icon = PHONE_PANE_ICONS[pane];
        const active = pane === value;
        return (
          <button
            key={pane}
            type="button"
            role="tab"
            aria-selected={active}
            className={customizationTabBarTab({ active })}
            onClick={() => onValueChange(pane)}
          >
            <Icon className="size-5" aria-hidden />
            <span className={customizationTabBarLabel()}>{t(PHONE_PANE_KEYS[pane])}</span>
          </button>
        );
      })}
    </div>
  );
}
