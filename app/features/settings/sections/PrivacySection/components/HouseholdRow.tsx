"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { EngineRow } from "../../../components/EngineRow";
import type { PrivacyCardProps } from "../types";

export function HouseholdRow({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateProfile();

  return (
    <EngineRow
      label={t("privacy.household.label")}
      anchor="household"
      labelTrailing={<InfoTooltip description={t("privacy.household.description")} />}
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
