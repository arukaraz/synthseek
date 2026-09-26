"use client";

import { useTranslation } from "react-i18next";

import { SourceOptions } from "./SourceOptions";
import { settingsHint, settingsSection, settingsSectionHeader, settingsSectionTitle } from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function SourceSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  if (view.sourceOptions.length < 2) return null;

  return (
    <section className={settingsSection()} aria-label={t("settings.source.caption")}>
      <div className={settingsSectionHeader()}>
        <span className={settingsSectionTitle()}>{t("settings.source.caption")}</span>
      </div>
      <SourceOptions
        options={view.sourceOptions}
        selected={view.chain.source?.key ?? null}
        label={t("settings.source.caption")}
        onSelect={actions.setSource}
      />
      <span className={settingsHint()}>{t("settings.source.hint")}</span>
    </section>
  );
}
