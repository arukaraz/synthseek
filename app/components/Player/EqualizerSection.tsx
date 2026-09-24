"use client";

import { ChevronDown, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { Input } from "@components/ui/Input";
import { Switch } from "@components/ui/Switch";
import {
  EQUALIZER_BANDS_HZ,
  EQUALIZER_MAX_DB,
  EQUALIZER_MIN_DB,
  EQUALIZER_PRESET_NAME_MAX_LENGTH,
  EQUALIZER_STEP_DB,
} from "@hooks/ui/player/constants";
import { equalizerPresetIds, isEqualizerPresetId, presetNameFrom } from "@hooks/ui/player/equalizer";

import { EqualizerBand } from "./EqualizerBand";
import { SettingsSlider } from "./SettingsSlider";
import { CUSTOM_PRESET_VALUE_PREFIX, EQUALIZER_SCALE_TICKS_DB } from "./constants";
import { formatGainDb, labelled, presetValueFor, presetRefFromValue } from "./helpers";
import {
  equalizerBands,
  equalizerFootnote,
  equalizerHeaderGroup,
  equalizerPresetTrigger,
  equalizerScale,
  iconButton,
  settingsHint,
  settingsPresetInput,
  settingsPresetRow,
  settingsSection,
  settingsSectionBody,
  settingsSectionHeader,
  settingsSectionTitle,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function EqualizerSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  const { equalizer } = view;
  const [draftName, setDraftName] = useState("");
  const presetName =
    equalizer.preset === null
      ? t("equalizer.custom")
      : equalizer.preset.kind === "builtIn"
        ? t(`equalizer.presets.${equalizer.preset.id}`)
        : equalizer.preset.name;
  const savable = presetNameFrom(draftName) !== null;

  return (
    <section className={settingsSection()} aria-label={t("equalizer.caption")}>
      <div className={settingsSectionHeader()}>
        <div className={equalizerHeaderGroup()}>
          <span className={settingsSectionTitle()}>{t("equalizer.caption")}</span>
          <Switch
            checked={equalizer.enabled}
            onCheckedChange={actions.setEqualizerEnabled}
            aria-label={t("equalizer.enabled")}
          />
        </div>
        <div className={equalizerHeaderGroup()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className={equalizerPresetTrigger()}
                disabled={!equalizer.enabled}
                aria-label={t("equalizer.preset")}
              >
                {presetName}
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={presetValueFor(equalizer.preset)}
                onValueChange={(next) => {
                  const preset = presetRefFromValue(next, isEqualizerPresetId);
                  if (preset !== null) actions.applyEqualizerPreset(preset);
                }}
              >
                {equalizerPresetIds().map((id) => (
                  <DropdownMenuRadioItem key={id} value={id}>
                    {t(`equalizer.presets.${id}`)}
                  </DropdownMenuRadioItem>
                ))}
                {equalizer.customPresets.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{t("equalizer.customGroup")}</DropdownMenuLabel>
                    {equalizer.customPresets.map((name) => (
                      <DropdownMenuRadioItem key={name} value={`${CUSTOM_PRESET_VALUE_PREFIX}${name}`}>
                        {name}
                      </DropdownMenuRadioItem>
                    ))}
                  </>
                ) : null}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {equalizer.preset?.kind === "custom" ? (
            <button
              type="button"
              className={iconButton({ size: "inline", tone: "danger" })}
              disabled={!equalizer.enabled}
              onClick={() => {
                if (equalizer.preset?.kind === "custom") actions.deleteEqualizerPreset(equalizer.preset.name);
              }}
              {...labelled(t("equalizer.deletePreset", { name: equalizer.preset.name }))}
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            className={iconButton({ size: "inline" })}
            disabled={!equalizer.enabled || (equalizer.preset?.kind === "builtIn" && equalizer.preset.id === "flat")}
            onClick={() => actions.applyEqualizerPreset({ kind: "builtIn", id: "flat" })}
            {...labelled(t("equalizer.reset"))}
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      <div className={settingsSectionBody()}>
        <div className={equalizerBands()}>
          <div className={equalizerScale()} aria-hidden>
            {EQUALIZER_SCALE_TICKS_DB.map((tick) => (
              <span key={tick}>{formatGainDb(tick)}</span>
            ))}
          </div>
          {EQUALIZER_BANDS_HZ.map((hz, band) => (
            <EqualizerBand
              key={hz}
              hz={hz}
              gainDb={equalizer.gainsDb[band] ?? 0}
              disabled={!equalizer.enabled}
              onChange={(gainDb) => actions.setEqualizerBand(band, gainDb)}
            />
          ))}
        </div>

        <SettingsSlider
          label={t("equalizer.preamp")}
          value={equalizer.preampDb}
          min={EQUALIZER_MIN_DB}
          max={EQUALIZER_MAX_DB}
          step={EQUALIZER_STEP_DB}
          unit="db"
          disabled={!equalizer.enabled}
          onChange={actions.setEqualizerPreamp}
        />

        <form
          className={settingsPresetRow()}
          onSubmit={(event) => {
            event.preventDefault();
            if (!savable) return;
            actions.saveEqualizerPreset(draftName);
            setDraftName("");
          }}
        >
          <Input
            size="sm"
            className={settingsPresetInput()}
            value={draftName}
            maxLength={EQUALIZER_PRESET_NAME_MAX_LENGTH}
            placeholder={t("equalizer.presetName")}
            aria-label={t("equalizer.presetName")}
            disabled={!equalizer.enabled}
            onChange={(event) => setDraftName(event.currentTarget.value)}
          />
          <Button type="submit" variant="secondary" size="sm" disabled={!equalizer.enabled || !savable}>
            {t("equalizer.savePreset")}
          </Button>
        </form>

        {equalizer.headroomDb < 0 || !view.activeDevice.local ? (
          <div className={equalizerFootnote()}>
            {equalizer.headroomDb < 0 ? (
              <span>{t("equalizer.headroom", { value: equalizer.headroomDb.toFixed(1) })}</span>
            ) : null}
            {view.activeDevice.local ? null : <span className={settingsHint()}>{t("equalizer.remoteHint")}</span>}
          </div>
        ) : null}
      </div>
    </section>
  );
}
