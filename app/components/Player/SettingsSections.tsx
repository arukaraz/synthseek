"use client";

import Link from "next/link";
import { Trans, useTranslation } from "react-i18next";

import { inlineLink } from "@components/HashLink";

import { AutoplaySection } from "./AutoplaySection";
import { CompressorSection } from "./CompressorSection";
import { ConversionSection } from "./ConversionSection";
import { EqualizerSection } from "./EqualizerSection";
import { LoudnessSection } from "./LoudnessSection";
import { SourceSection } from "./SourceSection";
import { TransitionSection } from "./TransitionSection";
import { settingsHint } from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function SettingsSections({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");

  return (
    <>
      <SourceSection view={view} actions={actions} />
      <EqualizerSection view={view} actions={actions} />
      <CompressorSection view={view} actions={actions} />
      <LoudnessSection view={view} actions={actions} />
      <span className={settingsHint()}>
        <Trans
          t={t}
          i18nKey="settings.loudness.alsoIn"
          components={{
            settings: <Link href="/settings/playback" className={inlineLink()} onClick={actions.toggleSettings} />,
          }}
        />
      </span>
      <TransitionSection view={view} actions={actions} />
      <AutoplaySection view={view} actions={actions} />
      <ConversionSection view={view} actions={actions} />
    </>
  );
}
