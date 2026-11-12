"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { usePrivacyOverview } from "@hooks/api";
import { useUpdateProfile } from "@hooks/api/mutations/auth/useUpdateProfile";

import { EngineRow } from "../../../components/EngineRow";
import type { PrivacyCardProps } from "../types";

export function RequestPrivacyRow({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateProfile();
  const overview = usePrivacyOverview();
  const locked = overview.data?.server.membersSeeRequests === false;

  return (
    <EngineRow
      label={t("privacy.requests.label")}
      anchor="privacy.requests"
      labelTrailing={
        <InfoTooltip description={locked ? t("privacy.requests.locked") : t("privacy.requests.description")} />
      }
      control={
        <Switch
          checked={user.showRequestName}
          disabled={locked || update.isPending}
          onCheckedChange={(showRequestName) => update.mutate({ showRequestName })}
          aria-label={t("privacy.requests.label")}
        />
      }
    />
  );
}
