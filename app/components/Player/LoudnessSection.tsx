"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { SettingsSlider } from "./SettingsSlider";
import { LOUDNESS_PREAMP_MAX_DB, LOUDNESS_PREAMP_MIN_DB, LOUDNESS_PREAMP_STEP_DB } from "./constants";
import {
  equalizerHeaderGroup,
  settingsHint,
  settingsSection,
  settingsSectionBody,
  settingsSectionHeader,
  settingsSectionTitle,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function LoudnessSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  const { loudness } = view;
  const [draftPreamp, setDraftPreamp] = useState(loudness.preAmpDb);

  useEffect(() => {
    setDraftPreamp(loudness.preAmpDb);
  }, [loudness.preAmpDb]);

  return (
    <section className={settingsSection()} aria-label={t("settings.loudness.caption")}>
      <div className={settingsSectionHeader()}>
        <div className={equalizerHeaderGroup()}>
          <span className={settingsSectionTitle()}>{t("settings.loudness.caption")}</span>
          <Switch
            checked={loudness.enabled}
            onCheckedChange={actions.setLoudnessEnabled}
            aria-label={t("settings.loudness.enabled")}
          />
        </div>
      </div>
      {loudness.enabled ? (
        <div className={settingsSectionBody()}>
          <SettingsSlider
            label={t("settings.loudness.preamp")}
            value={draftPreamp}
            min={LOUDNESS_PREAMP_MIN_DB}
            max={LOUDNESS_PREAMP_MAX_DB}
            step={LOUDNESS_PREAMP_STEP_DB}
            unit="db"
            onChange={setDraftPreamp}
            onCommit={(value) => {
              if (value !== loudness.preAmpDb) actions.setLoudnessPreamp(value);
            }}
          />
        </div>
      ) : null}
      <span className={settingsHint()}>{t("settings.loudness.hint")}</span>
    </section>
  );
}
