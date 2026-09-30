"use client";

import { useTranslation } from "react-i18next";

import { useUpdateQuotas } from "@hooks/api/mutations/settings/useUpdateQuotas";
import { useSettings } from "@hooks/api/queries/useSettings";

import { EngineRow } from "../../../components/EngineRow";
import { SaveBar } from "../../../components/SaveBar";
import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsNumberInput } from "../../../components/SettingsNumberInput";
import { useSettingsForm } from "../../../hooks/useSettingsForm";

export function QuotasCard() {
  const { t } = useTranslation("settings");
  const settings = useSettings();
  const update = useUpdateQuotas();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(settings.data?.quotas);

  if (!draft) return null;

  return (
    <SettingsCard title={t("members.quotas.cardTitle")} description={t("members.quotas.cardDescription")}>
      <EngineRow
        label={t("members.quotas.tracksPerWindow.label")}
        description={t("members.quotas.tracksPerWindow.description")}
        control={
          <SettingsNumberInput
            value={draft.tracksPerWindow}
            onChange={(value) => setField("tracksPerWindow", value)}
            min={0}
            ariaLabel={t("members.quotas.tracksPerWindow.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("members.quotas.windowDays.label")}
        description={t("members.quotas.windowDays.description")}
        control={
          <SettingsNumberInput
            value={draft.windowDays}
            onChange={(value) => setField("windowDays", value)}
            min={1}
            max={365}
            suffix={t("members.quotas.windowDays.unit")}
            ariaLabel={t("members.quotas.windowDays.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("members.quotas.userStorageGb.label")}
        description={t("members.quotas.userStorageGb.description")}
        control={
          <SettingsNumberInput
            value={draft.userStorageGb}
            onChange={(value) => setField("userStorageGb", value)}
            min={0}
            suffix={t("members.quotas.unitGb")}
            ariaLabel={t("members.quotas.userStorageGb.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("members.quotas.libraryStorageGb.label")}
        description={t("members.quotas.libraryStorageGb.description")}
        control={
          <SettingsNumberInput
            value={draft.libraryStorageGb}
            onChange={(value) => setField("libraryStorageGb", value)}
            min={0}
            suffix={t("members.quotas.unitGb")}
            ariaLabel={t("members.quotas.libraryStorageGb.ariaLabel")}
          />
        }
      />
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
