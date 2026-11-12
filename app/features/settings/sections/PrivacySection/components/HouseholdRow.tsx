"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { usePrivacyOverview } from "@hooks/api";
import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { EngineRow } from "../../../components/EngineRow";
import type { PrivacyCardProps } from "../types";

export function HouseholdRow({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateProfile();
  const overview = usePrivacyOverview();
  const nowPlayingOff = overview.data?.server.nowPlayingEnabled === false;

  return (
    <EngineRow
      label={t("privacy.household.label")}
      anchor="household"
      labelTrailing={
        <InfoTooltip
          description={t("privacy.household.description")}
          secondary={nowPlayingOff ? t("privacy.household.nowPlayingOff") : undefined}
        />
      }
      control={
        <Switch
          checked={user.shareListening}
          disabled={update.isPending}
          onCheckedChange={(shareListening) => update.mutate({ shareListening })}
          aria-label={t("privacy.household.label")}
        />
      }
    />
  );
}
