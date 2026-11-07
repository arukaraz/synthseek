"use client";

import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import {
  CUSTOMIZATION_SECTION_ICONS,
  CUSTOMIZATION_SECTION_KEYS,
  CUSTOMIZATION_SECTIONS,
  NAV_KEY_DELTAS,
} from "./constants";
import { customizationNav, customizationNavTab } from "./styles";
import type { CustomizationNavProps } from "./types";

export function CustomizationNav({ value, onValueChange }: CustomizationNavProps) {
  const { t } = useTranslation(["widgets"]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = NAV_KEY_DELTAS.get(event.key);
    if (delta === undefined) return;
    event.preventDefault();
    const count = CUSTOMIZATION_SECTIONS.length;
    const next = CUSTOMIZATION_SECTIONS[(CUSTOMIZATION_SECTIONS.indexOf(value) + delta + count) % count];
    if (!next) return;
    onValueChange(next);
    event.currentTarget.querySelector<HTMLElement>(`[data-section="${next}"]`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-orientation="vertical"
      aria-label={t("board.customization.sections.label")}
      className={customizationNav()}
      onKeyDown={onKeyDown}
    >
      {CUSTOMIZATION_SECTIONS.map((section) => {
        const Icon = CUSTOMIZATION_SECTION_ICONS[section];
        const active = section === value;
        return (
          <button
            key={section}
            type="button"
            role="tab"
            data-section={section}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={customizationNavTab({ active })}
            onClick={() => onValueChange(section)}
          >
            <Icon className="size-4" aria-hidden />
            {t(CUSTOMIZATION_SECTION_KEYS[section])}
          </button>
        );
      })}
    </div>
  );
}
