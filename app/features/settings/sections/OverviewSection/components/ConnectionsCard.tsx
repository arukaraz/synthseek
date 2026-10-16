"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useDownloadSourcesAvailability } from "@hooks/api/queries/useDownloadSourcesAvailability";
import { useLidarrStatus } from "@hooks/api/queries/useLidarrStatus";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useSlskdStatus } from "@hooks/api/queries/useSlskdStatus";
import { cn } from "@utils/cn";

import { SettingsCard } from "../../../components/SettingsCard";
import { useSettingsNavigate } from "../../../components/SettingsSaveScope";
import { statusBadge, statusDot } from "../../../styles";
import { connectionRows } from "../helpers";
import { connectionButton, rowName, rowRole, rowText } from "../styles";

export function ConnectionsCard() {
  const { t } = useTranslation("settings");
  const navigate = useSettingsNavigate();
  const settings = useSettings();
  const availability = useDownloadSourcesAvailability();
  const slskd = useSlskdStatus();
  const lidarr = useLidarrStatus();

  return (
    <SettingsCard title={t("overview.connections.title")}>
      {settings.data ? (
        <div className="flex flex-col">
          {connectionRows(settings.data, availability.data, slskd.data?.status, lidarr.data?.status).map((row) => (
            <button key={row.id} type="button" className={connectionButton()} onClick={() => navigate(row.href)}>
              <span className={rowText()}>
                <span className={cn(rowName(), "block")}>{row.name}</span>
                <span className={cn(rowRole(), "block")}>{row.role}</span>
              </span>
              <span className={statusBadge({ tone: row.status.tone })}>
                <span className={statusDot({ tone: row.status.tone })} />
                {row.status.label}
              </span>
              <ChevronRight className="text-fg/40 size-4 shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <span className="text-fg/60 text-sm">{t("common.loading")}</span>
      )}
    </SettingsCard>
  );
}
