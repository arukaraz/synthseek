"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import {
  equalizerHeaderGroup,
  settingsHint,
  settingsSection,
  settingsSectionHeader,
  settingsSectionTitle,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function AutoplaySection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");

  return (
    <section className={settingsSection()} aria-label={t("settings.autoplay.caption")}>
      <div className={settingsSectionHeader()}>
        <div className={equalizerHeaderGroup()}>
          <span className={settingsSectionTitle()}>{t("settings.autoplay.caption")}</span>
          <Switch
            checked={view.autoplay}
            onCheckedChange={actions.setAutoplayEnabled}
            aria-label={t("settings.autoplay.enabled")}
          />
        </div>
      </div>
      <span className={settingsHint()}>{t("settings.autoplay.hint")}</span>
    </section>
  );
}
