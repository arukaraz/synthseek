"use client";

import { useTranslation } from "react-i18next";

import { changeDot, sectionButton, sectionsList } from "./styles";
import type { SectionNavProps } from "./types";

export function SectionNav({ sections, current, onSelect }: SectionNavProps) {
  const { t } = useTranslation("themeEditor");

  return (
    <nav className={sectionsList()} aria-label={t("visual.sections")}>
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          className={sectionButton({ active: section.id === current })}
          aria-current={section.id === current ? "true" : undefined}
          onClick={() => onSelect(section.id)}
        >
          <span>{section.label}</span>
          {section.dirty ? (
            <span className={changeDot()} title={t("bar.unsaved")}>
              <span className="sr-only">{t("bar.unsaved")}</span>
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}
