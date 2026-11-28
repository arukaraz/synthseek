"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";
import { SelectMenu } from "@components/ui/SelectMenu";
import { Switch } from "@components/ui/Switch";
import { useAccessibility } from "@modules/providers/AccessibilityProvider";

import { TEXT_SIZES } from "@modules/accessibility";

import { ControlRow } from "./ControlRow";
import {
  BUTTON_NAMES_CONTROL,
  MODE_CONTROL,
  MONO_AUDIO_CONTROL,
  PREFERENCE_CONTROLS,
  PREFERENCE_KEYS,
  PREFERENCE_ORDER,
  REACTIVE_WAVE_CONTROL,
  SHORTCUTS_CONTROL,
  TEXT_SIZE_CONTROL,
  TEXT_SIZE_KEYS,
  TOAST_DURATION_CONTROL,
  TOAST_DURATION_KEYS,
  TOAST_DURATION_ORDER,
} from "./constants";
import { preferencePatch } from "./helpers";
import { controlList } from "./styles";
import type { AccessibilityControlsProps } from "./types";

export function AccessibilityControls({ scope }: AccessibilityControlsProps) {
  const { t } = useTranslation("settings");
  const accessibility = useAccessibility();
  const baseId = useId();
  const modeDescription = `${baseId}-mode`;
  const durationDescription = `${baseId}-duration`;
  const shortcutsDescription = `${baseId}-shortcuts`;
  const textSizeDescription = `${baseId}-textSize`;
  const buttonNamesDescription = `${baseId}-buttonNames`;
  const monoAudioDescription = `${baseId}-monoAudio`;
  const reactiveWaveDescription = `${baseId}-reactiveWave`;

  return (
    <div className={controlList()}>
      <ControlRow definition={MODE_CONTROL} descriptionId={modeDescription}>
        <Switch
          checked={accessibility.mode}
          onCheckedChange={(mode) => accessibility.update({ mode })}
          aria-label={t(MODE_CONTROL.labelKey)}
          aria-describedby={modeDescription}
        />
      </ControlRow>
      {PREFERENCE_CONTROLS.map((control) => (
        <ControlRow key={control.key} definition={control} descriptionId={`${baseId}-${control.key}`}>
          <SegmentedControl
            value={accessibility[control.key]}
            options={PREFERENCE_ORDER.map((choice) => ({ value: choice, label: t(PREFERENCE_KEYS[choice]) }))}
            onChange={(choice) => accessibility.update(preferencePatch(control.key, choice))}
            ariaLabel={t(control.labelKey)}
          />
        </ControlRow>
      ))}
      {scope === "account" ? (
        <>
          <ControlRow definition={TOAST_DURATION_CONTROL} descriptionId={durationDescription}>
            <SelectMenu
              value={accessibility.toastDuration}
              options={TOAST_DURATION_ORDER.map((duration) => ({
                value: duration,
                label: t(TOAST_DURATION_KEYS[duration]),
              }))}
              onChange={(toastDuration) => accessibility.update({ toastDuration })}
              ariaLabel={t(TOAST_DURATION_CONTROL.labelKey)}
            />
          </ControlRow>
          <ControlRow definition={SHORTCUTS_CONTROL} descriptionId={shortcutsDescription}>
            <Switch
              checked={accessibility.singleKeyShortcuts}
              onCheckedChange={(singleKeyShortcuts) => accessibility.update({ singleKeyShortcuts })}
              aria-label={t(SHORTCUTS_CONTROL.labelKey)}
              aria-describedby={shortcutsDescription}
            />
          </ControlRow>
        </>
      ) : null}
      <ControlRow definition={TEXT_SIZE_CONTROL} descriptionId={textSizeDescription}>
        <SelectMenu
          value={accessibility.textSize}
          options={TEXT_SIZES.map((size) => ({ value: size, label: t(TEXT_SIZE_KEYS[size]) }))}
          onChange={accessibility.setTextSize}
          ariaLabel={t(TEXT_SIZE_CONTROL.labelKey)}
        />
      </ControlRow>
      <ControlRow definition={BUTTON_NAMES_CONTROL} descriptionId={buttonNamesDescription}>
        <Switch
          checked={accessibility.buttonNames}
          onCheckedChange={(buttonNames) => accessibility.update({ buttonNames })}
          aria-label={t(BUTTON_NAMES_CONTROL.labelKey)}
          aria-describedby={buttonNamesDescription}
        />
      </ControlRow>
      {scope === "account" ? (
        <>
          <ControlRow definition={MONO_AUDIO_CONTROL} descriptionId={monoAudioDescription}>
            <Switch
              checked={accessibility.monoAudio}
              onCheckedChange={(monoAudio) => accessibility.update({ monoAudio })}
              aria-label={t(MONO_AUDIO_CONTROL.labelKey)}
              aria-describedby={monoAudioDescription}
            />
          </ControlRow>
          <ControlRow definition={REACTIVE_WAVE_CONTROL} descriptionId={reactiveWaveDescription}>
            <Switch
              checked={accessibility.reactiveWave}
              onCheckedChange={(reactiveWave) => accessibility.update({ reactiveWave })}
              aria-label={t(REACTIVE_WAVE_CONTROL.labelKey)}
              aria-describedby={reactiveWaveDescription}
            />
          </ControlRow>
        </>
      ) : null}
    </div>
  );
}
