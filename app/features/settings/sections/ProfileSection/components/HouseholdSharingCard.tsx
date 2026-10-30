"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";
import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { SettingsCard } from "../../../components/SettingsCard";
import { householdDescription, listeningToggleLabel, listeningToggleRow } from "../styles";
import type { ProfileCardProps } from "../types";

export function HouseholdSharingCard({ user }: ProfileCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateProfile();

  return (
    <SettingsCard title={t("profile.household.title")} anchor="household">
      <div className={listeningToggleRow()}>
        <div className={householdDescription()}>
          <p className={listeningToggleLabel()}>{t("profile.household.label")}</p>
          <p className={listeningToggleLabel()}>{t("profile.household.description")}</p>
        </div>
        <Switch
          checked={user.shareListening}
          disabled={update.isPending}
          onCheckedChange={(shareListening) => update.mutate({ shareListening })}
          aria-label={t("profile.household.label")}
        />
      </div>
    </SettingsCard>
  );
}
