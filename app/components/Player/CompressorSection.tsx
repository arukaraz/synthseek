"use client";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { Switch } from "@components/ui/Switch";
import { compressorPresetIds, isCompressorPresetId } from "@hooks/ui/player/compressor";
import { COMPRESSOR_LIMITS, COMPRESSOR_PARAMS } from "@hooks/ui/player/constants";

import { SettingsSlider } from "./SettingsSlider";
import { COMPRESSOR_PARAM_UNITS } from "./constants";
import {
  equalizerHeaderGroup,
  equalizerPresetTrigger,
  settingsHint,
  settingsSection,
  settingsSectionBody,
  settingsSectionHeader,
  settingsSectionTitle,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function CompressorSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  const { compressor } = view;
  const presetName =
    compressor.preset === null
      ? t("settings.compressor.custom")
      : t(`settings.compressor.presets.${compressor.preset}`);

  return (
    <section className={settingsSection()} aria-label={t("settings.compressor.caption")}>
      <div className={settingsSectionHeader()}>
        <div className={equalizerHeaderGroup()}>
          <span className={settingsSectionTitle()}>{t("settings.compressor.caption")}</span>
          <Switch
            checked={compressor.enabled}
            onCheckedChange={actions.setCompressorEnabled}
            aria-label={t("settings.compressor.enabled")}
          />
        </div>
        {compressor.enabled ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className={equalizerPresetTrigger()}
                aria-label={t("settings.compressor.preset")}
              >
                {presetName}
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={compressor.preset ?? ""}
                onValueChange={(next) => {
                  if (isCompressorPresetId(next)) actions.applyCompressorPreset(next);
                }}
              >
                {compressorPresetIds().map((id) => (
                  <DropdownMenuRadioItem key={id} value={id}>
                    {t(`settings.compressor.presets.${id}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      {compressor.enabled ? (
        <div className={settingsSectionBody()}>
          {COMPRESSOR_PARAMS.map((param) => (
            <SettingsSlider
              key={param}
              label={t(`settings.compressor.params.${param}`)}
              value={compressor[param]}
              min={COMPRESSOR_LIMITS[param].min}
              max={COMPRESSOR_LIMITS[param].max}
              step={COMPRESSOR_LIMITS[param].step}
              unit={COMPRESSOR_PARAM_UNITS[param]}
              onChange={(value) => actions.setCompressorParam(param, value)}
            />
          ))}
        </div>
      ) : null}
      <span className={settingsHint()}>{t("settings.compressor.hint")}</span>
    </section>
  );
}
