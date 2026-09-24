"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import {
  TRANSITION_CURVES,
  TRANSITION_MAX_SECONDS,
  TRANSITION_MIN_SECONDS,
  TRANSITION_MODES,
  TRANSITION_STEP_SECONDS,
} from "@hooks/ui/player/constants";
import { isTransitionCurve, isTransitionMode } from "@hooks/ui/player/transition";

import { SettingsSlider } from "./SettingsSlider";
import {
  equalizerHeaderGroup,
  equalizerPresetTrigger,
  settingsHint,
  settingsSection,
  settingsSectionBody,
  settingsSectionHeader,
  settingsSectionTitle,
  settingsSlider,
  settingsSliderLabel,
} from "./styles";
import type { PlayerSettingsSectionProps } from "./types";

export function TransitionSection({ view, actions }: PlayerSettingsSectionProps) {
  const { t } = useTranslation("player");
  const { transition } = view;
  const [draftSeconds, setDraftSeconds] = useState(transition.seconds);

  useEffect(() => {
    setDraftSeconds(transition.seconds);
  }, [transition.seconds]);

  return (
    <section className={settingsSection()} aria-label={t("settings.transition.caption")}>
      <div className={settingsSectionHeader()}>
        <div className={equalizerHeaderGroup()}>
          <span className={settingsSectionTitle()}>{t("settings.transition.caption")}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className={equalizerPresetTrigger()}
              aria-label={t("settings.transition.mode")}
            >
              {t(`settings.transition.modes.${transition.mode}`)}
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={transition.mode}
              onValueChange={(next) => {
                if (isTransitionMode(next)) actions.setTransition({ ...transition, mode: next });
              }}
            >
              {TRANSITION_MODES.map((mode) => (
                <DropdownMenuRadioItem key={mode} value={mode}>
                  {t(`settings.transition.modes.${mode}`)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {transition.mode === "gapless" ? null : (
        <div className={settingsSectionBody()}>
          <SettingsSlider
            label={t("settings.transition.seconds")}
            value={draftSeconds}
            min={TRANSITION_MIN_SECONDS}
            max={TRANSITION_MAX_SECONDS}
            step={TRANSITION_STEP_SECONDS}
            unit="s"
            onChange={setDraftSeconds}
            onCommit={(value) => {
              if (value !== transition.seconds) actions.setTransition({ ...transition, seconds: value });
            }}
          />
          <div className={settingsSlider()}>
            <span className={settingsSliderLabel()}>{t("settings.transition.curve")}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className={equalizerPresetTrigger()}
                  aria-label={t("settings.transition.curve")}
                >
                  {t(`settings.transition.curves.${transition.curve}`)}
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={transition.curve}
                  onValueChange={(next) => {
                    if (isTransitionCurve(next)) actions.setTransition({ ...transition, curve: next });
                  }}
                >
                  {TRANSITION_CURVES.map((curve) => (
                    <DropdownMenuRadioItem key={curve} value={curve}>
                      {t(`settings.transition.curves.${curve}`)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      <span className={settingsHint()}>{t(`settings.transition.hints.${transition.mode}`)}</span>
    </section>
  );
}
