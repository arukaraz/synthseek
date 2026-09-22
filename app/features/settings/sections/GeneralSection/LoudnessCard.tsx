"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";

import { useSetLoudness } from "@hooks/api/mutations/auth/useSetLoudness";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { EngineRow } from "../../components/EngineRow";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { PREAMP_MAX_DB, PREAMP_MIN_DB, PREAMP_STEP_DB } from "./constants";

export function LoudnessCard() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();
  const setLoudness = useSetLoudness();
  const [draftPreamp, setDraftPreamp] = useState(currentUser?.loudnessPreampDb ?? 0);

  useEffect(() => {
    if (currentUser) setDraftPreamp(currentUser.loudnessPreampDb);
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <SettingsCard title={t("general.loudness.title")} description={t("general.loudness.description")}>
      <EngineRow
        label={t("general.loudness.enabled.label")}
        description={t("general.loudness.enabled.description")}
        control={
          <Switch
            checked={currentUser.loudnessNormalization}
            onCheckedChange={(next) => setLoudness.mutate({ loudnessNormalization: next })}
            aria-label={t("general.loudness.enabled.label")}
          />
        }
      />
      <EngineRow
        label={t("general.loudness.preamp.label")}
        description={t("general.loudness.preamp.description")}
        control={
          <div
            onBlur={() => {
              if (draftPreamp !== currentUser.loudnessPreampDb) setLoudness.mutate({ loudnessPreampDb: draftPreamp });
            }}
          >
            <SettingsNumberInput
              value={draftPreamp}
              onChange={setDraftPreamp}
              min={PREAMP_MIN_DB}
              max={PREAMP_MAX_DB}
              step={PREAMP_STEP_DB}
              suffix={t("general.loudness.preamp.suffix")}
              disabled={!currentUser.loudnessNormalization}
              ariaLabel={t("general.loudness.preamp.label")}
            />
          </div>
        }
      />
    </SettingsCard>
  );
}
