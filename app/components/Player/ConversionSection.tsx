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
import { CONVERSION_BITRATES_KBPS } from "@hooks/ui/player/constants";

import {
  equalizerHeaderGroup,
  equalizerPresetTrigger,
  settingsHint,
  settingsSection,
  settingsSectionHeader,
  settingsSectionTitle,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function ConversionSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  const { conversion } = view;

  return (
    <section className={settingsSection()} aria-label={t("settings.conversion.caption")}>
      <div className={settingsSectionHeader()}>
        <div className={equalizerHeaderGroup()}>
          <span className={settingsSectionTitle()}>{t("settings.conversion.caption")}</span>
          <Switch
            checked={conversion.enabled}
            onCheckedChange={(enabled) => actions.setConversion({ ...conversion, enabled })}
            aria-label={t("settings.conversion.enabled")}
          />
        </div>
        {conversion.enabled ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className={equalizerPresetTrigger()}
                aria-label={t("settings.conversion.bitrate")}
              >
                {t("settings.conversion.bitrateValue", { kbps: conversion.bitrateKbps })}
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={String(conversion.bitrateKbps)}
                onValueChange={(next) => {
                  const bitrateKbps = Number(next);
                  if (CONVERSION_BITRATES_KBPS.includes(bitrateKbps))
                    actions.setConversion({ ...conversion, bitrateKbps });
                }}
              >
                {CONVERSION_BITRATES_KBPS.map((kbps) => (
                  <DropdownMenuRadioItem key={kbps} value={String(kbps)}>
                    {t("settings.conversion.bitrateValue", { kbps })}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <span className={settingsHint()}>{t("settings.conversion.hint")}</span>
    </section>
  );
}
