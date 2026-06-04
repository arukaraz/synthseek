"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";
import { useUpdateLogLevel } from "@hooks/api/mutations/settings/useUpdateLogLevel";

import { SegmentedControl } from "../../components/SegmentedControl";
import { SettingsCard } from "../../components/SettingsCard";
import type { LogLevelSetting } from "./types";

export function LogLevelCard() {
  const { t } = useTranslation("settings");
  const { data, isLoading } = useSettings();
  const updateLogLevel = useUpdateLogLevel();
  const current = data?.system.logLevel;

  const options: ReadonlyArray<{ value: LogLevelSetting; label: string }> = [
    { value: "DEBUG", label: t("logs.level.options.debug") },
    { value: "INFO", label: t("logs.level.options.info") },
    { value: "WARN", label: t("logs.level.options.warn") },
    { value: "ERROR", label: t("logs.level.options.error") },
  ];

  return (
    <SettingsCard title={t("logs.level.title")} description={t("logs.level.description")}>
      {isLoading || !current ? (
        <span className="text-fg/60 text-sm">{t("logs.level.loading")}</span>
      ) : (
        <SegmentedControl<LogLevelSetting>
          value={current}
          options={options}
          onChange={(level) => updateLogLevel.mutate({ level })}
          disabled={updateLogLevel.isPending}
          ariaLabel={t("logs.level.ariaLabel")}
        />
      )}
    </SettingsCard>
  );
}
