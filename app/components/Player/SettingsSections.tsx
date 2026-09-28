"use client";

import { AutoplaySection } from "./AutoplaySection";
import { CompressorSection } from "./CompressorSection";
import { ConversionSection } from "./ConversionSection";
import { EqualizerSection } from "./EqualizerSection";
import { LoudnessSection } from "./LoudnessSection";
import { SourceSection } from "./SourceSection";
import { TransitionSection } from "./TransitionSection";
import type { PlayerSettingsSectionProps } from "./types";

export function SettingsSections({ view, actions }: PlayerSettingsSectionProps) {
  return (
    <>
      <SourceSection view={view} actions={actions} />
      <EqualizerSection view={view} actions={actions} />
      <CompressorSection view={view} actions={actions} />
      <LoudnessSection view={view} actions={actions} />
      <TransitionSection view={view} actions={actions} />
      <AutoplaySection view={view} actions={actions} />
      <ConversionSection view={view} actions={actions} />
    </>
  );
}
