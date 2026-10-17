"use client";

import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ProgressBar } from "@components/ui/ProgressBar";
import { useDownloadSourcesAvailability } from "@hooks/api/queries/useDownloadSourcesAvailability";
import { useSettings } from "@hooks/api/queries/useSettings";

import { SettingsCard } from "../../../components/SettingsCard";
import { useSettingsNavigate } from "../../../components/SettingsSaveScope";
import { setupChecks } from "../helpers";
import { checkLabel, checkMark, listRow } from "../styles";

export function SetupChecklistCard() {
  const { t } = useTranslation("settings");
  const navigate = useSettingsNavigate();
  const settings = useSettings();
  const availability = useDownloadSourcesAvailability();

  if (!settings.data || availability.isLoading) return null;

  const checks = setupChecks(settings.data, availability.data);
  const done = checks.filter((check) => check.done).length;
  if (done === checks.length) return null;

  return (
    <SettingsCard
      title={t("overview.setup.title")}
      trailing={
        <span className="text-fg/50 text-xs">{t("overview.setup.progress", { done, total: checks.length })}</span>
      }
    >
      <ProgressBar progress={(done / checks.length) * 100} size="sm" />
      <div className="flex flex-col">
        {checks.map((check) => (
          <div key={check.id} className={listRow()}>
            <span className={checkMark({ done: check.done })}>{check.done ? <Check className="size-3" /> : null}</span>
            <span className={checkLabel({ done: check.done })}>{t(check.labelKey)}</span>
            {check.done ? null : (
              <Button size="sm" variant="outline" onClick={() => navigate(check.href)}>
                {t("overview.setup.action")}
              </Button>
            )}
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
