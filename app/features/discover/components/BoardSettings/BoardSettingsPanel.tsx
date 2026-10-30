"use client";

import { useTranslation } from "react-i18next";

import { AppearanceSection } from "./AppearanceSection";
import { settingsGrid, settingsSection, settingsTitle } from "./styles";
import { TemplateExport } from "./TemplateExport";
import { TemplateImport } from "./TemplateImport";
import type { BoardSettingsPanelProps } from "./types";

export function BoardSettingsPanel({ items, onApplied }: BoardSettingsPanelProps) {
  const { t } = useTranslation("widgets");

  return (
    <div className={settingsGrid()}>
      <AppearanceSection />
      <section className={settingsSection()} aria-labelledby="board-templates-title">
        <h3 id="board-templates-title" className={settingsTitle()}>
          {t("board.templates.title")}
        </h3>
        <TemplateExport items={items} />
        <TemplateImport onApplied={onApplied} />
      </section>
    </div>
  );
}
