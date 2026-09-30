"use client";

import { useTranslation } from "react-i18next";

import { useMyQuota } from "@hooks/api/queries/useMyQuota";

import { SettingsCard } from "../../../components/SettingsCard";
import { quotaStoragePending, quotaStorageValue, quotaTracksValue } from "../helpers";
import { quotaMessage } from "../styles";
import { QuotaRow } from "./QuotaRow";

export function QuotaCard() {
  const { t } = useTranslation("settings");
  const quota = useMyQuota();
  const usage = quota.data;

  return (
    <SettingsCard title={t("profile.quota.title")}>
      {quota.isError ? <p className={quotaMessage()}>{t("profile.quota.unavailable")}</p> : null}
      {usage?.exempt ? <p className={quotaMessage()}>{t("profile.quota.exempt")}</p> : null}
      {usage && !usage.exempt ? (
        <QuotaRow label={t("profile.quota.tracksLabel")} value={quotaTracksValue(usage.tracks)} note={null} />
      ) : null}
      {usage && !usage.exempt ? (
        <QuotaRow
          label={t("profile.quota.storageLabel")}
          value={quotaStorageValue(usage.storage)}
          note={quotaStoragePending(usage.storage)}
        />
      ) : null}
    </SettingsCard>
  );
}
