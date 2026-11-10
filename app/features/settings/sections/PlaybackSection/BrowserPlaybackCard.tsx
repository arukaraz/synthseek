"use client";

import { useTranslation } from "react-i18next";

import { CompressorSection, ConversionSection, EqualizerSection, TransitionSection } from "@components/Player";
import { usePlayerSettings } from "@hooks/ui/player";

import { SettingsCard } from "../../components/SettingsCard";

export function BrowserPlaybackCard() {
  const { t } = useTranslation("settings");
  const { view, actions } = usePlayerSettings();

  return (
    <SettingsCard
      title={t("playback.browser.title")}
      description={t("playback.browser.description")}
      anchor="playback.browser"
    >
      <EqualizerSection view={view} actions={actions} />
      <CompressorSection view={view} actions={actions} />
      <TransitionSection view={view} actions={actions} />
      <ConversionSection view={view} actions={actions} />
    </SettingsCard>
  );
}
