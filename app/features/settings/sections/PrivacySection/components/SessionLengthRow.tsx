"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { SelectMenu } from "@components/ui/SelectMenu";
import { usePrivacyOverview, useSetPrivateSessionMinutes } from "@hooks/api";

import { EngineRow } from "../../../components/EngineRow";
import { SettingsNumberInput } from "../../../components/SettingsNumberInput";
import { SESSION_LENGTH_KEYS, SESSION_LENGTH_ORDER } from "../constants";
import { minutesOfChoice, sessionLengthChoice } from "../helpers";
import { privacyControl, sessionMinutes, sessionSelect } from "../styles";
import type { PrivacyCardProps, SessionLengthChoice } from "../types";

export function SessionLengthRow({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useSetPrivateSessionMinutes();
  const bounds = usePrivacyOverview().data?.sessionMinutes;
  const [custom, setCustom] = useState(false);
  const choice = sessionLengthChoice(user.privateSessionMinutes, custom);

  const choose = (next: SessionLengthChoice) => {
    const minutes = minutesOfChoice(next);
    setCustom(next === "custom");
    if (minutes !== undefined) update.mutate({ minutes });
    else if (user.privateSessionMinutes === null && bounds) update.mutate({ minutes: bounds.customStart });
  };

  return (
    <EngineRow
      label={t("privacy.sessionLength.label")}
      anchor="privacy.sessionLength"
      labelTrailing={<InfoTooltip description={t("privacy.sessionLength.description")} />}
      control={
        <div className={privacyControl()}>
          {choice === "custom" && user.privateSessionMinutes !== null && bounds ? (
            <SettingsNumberInput
              value={user.privateSessionMinutes}
              min={bounds.min}
              max={bounds.max}
              step={1}
              suffix={t("privacy.sessionLength.minutes")}
              ariaLabel={t("privacy.sessionLength.custom")}
              className={sessionMinutes()}
              onChange={(minutes) => {
                if (minutes >= bounds.min && minutes <= bounds.max) {
                  update.mutate({ minutes: Math.round(minutes) });
                }
              }}
            />
          ) : null}
          <div className={sessionSelect()}>
            <SelectMenu
              value={choice}
              disabled={!bounds}
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
