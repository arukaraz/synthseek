"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { SelectMenu } from "@components/ui/SelectMenu";
import { useSetPrivateSessionMinutes } from "@hooks/api";

import { EngineRow } from "../../../components/EngineRow";
import { SettingsNumberInput } from "../../../components/SettingsNumberInput";
import {
  SESSION_CUSTOM_MAX_MINUTES,
  SESSION_CUSTOM_MIN_MINUTES,
  SESSION_CUSTOM_START_MINUTES,
  SESSION_LENGTH_KEYS,
  SESSION_LENGTH_ORDER,
} from "../constants";
import { minutesOfChoice, sessionLengthChoice } from "../helpers";
import { privacyControl, sessionMinutes, sessionSelect } from "../styles";
import type { PrivacyCardProps, SessionLengthChoice } from "../types";

export function SessionLengthRow({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useSetPrivateSessionMinutes();
  const [custom, setCustom] = useState(false);
  const choice = sessionLengthChoice(user.privateSessionMinutes, custom);

  const choose = (next: SessionLengthChoice) => {
    const minutes = minutesOfChoice(next);
    setCustom(next === "custom");
    if (minutes !== undefined) update.mutate({ minutes });
    else if (user.privateSessionMinutes === null) update.mutate({ minutes: SESSION_CUSTOM_START_MINUTES });
  };

  return (
    <EngineRow
      label={t("privacy.sessionLength.label")}
      anchor="privacy.sessionLength"
      labelTrailing={<InfoTooltip description={t("privacy.sessionLength.description")} />}
      control={
        <div className={privacyControl()}>
          {choice === "custom" && user.privateSessionMinutes !== null ? (
            <SettingsNumberInput
              value={user.privateSessionMinutes}
              min={SESSION_CUSTOM_MIN_MINUTES}
              max={SESSION_CUSTOM_MAX_MINUTES}
              step={1}
              suffix={t("privacy.sessionLength.minutes")}
              ariaLabel={t("privacy.sessionLength.custom")}
              className={sessionMinutes()}
              onChange={(minutes) => {
                if (minutes >= SESSION_CUSTOM_MIN_MINUTES && minutes <= SESSION_CUSTOM_MAX_MINUTES) {
                  update.mutate({ minutes: Math.round(minutes) });
                }
              }}
            />
          ) : null}
          <div className={sessionSelect()}>
            <SelectMenu
              value={choice}
              options={SESSION_LENGTH_ORDER.map((value) => ({ value, label: t(SESSION_LENGTH_KEYS[value]) }))}
              onChange={choose}
              ariaLabel={t("privacy.sessionLength.label")}
            />
          </div>
        </div>
      }
    />
  );
}
