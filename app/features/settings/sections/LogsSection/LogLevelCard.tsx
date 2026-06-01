"use client";

import { useSettings } from "@hooks/api/queries/useSettings";
import { useUpdateLogLevel } from "@hooks/api/mutations/settings/useUpdateLogLevel";

import { SegmentedControl } from "../../components/SegmentedControl";
import { SettingsCard } from "../../components/SettingsCard";
import { LOG_LEVEL_CARD_DESCRIPTION, LOG_LEVEL_OPTIONS } from "./constants";
import type { LogLevelSetting } from "./types";

export function LogLevelCard() {
  const { data, isLoading } = useSettings();
  const updateLogLevel = useUpdateLogLevel();
  const current = data?.system.logLevel;

  return (
    <SettingsCard title="Level" description={LOG_LEVEL_CARD_DESCRIPTION}>
      {isLoading || !current ? (
        <span className="text-fg/60 text-sm">Loading…</span>
      ) : (
        <SegmentedControl<LogLevelSetting>
          value={current}
          options={LOG_LEVEL_OPTIONS}
          onChange={(level) => updateLogLevel.mutate({ level })}
          disabled={updateLogLevel.isPending}
          ariaLabel="Server log level"
        />
      )}
    </SettingsCard>
  );
}
