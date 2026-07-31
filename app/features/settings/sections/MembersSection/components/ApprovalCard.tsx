"use client";

import { useTranslation } from "react-i18next";

import { Switch } from "@components/ui/Switch";
import { useUpdateUsers } from "@hooks/api/mutations/settings/useUpdateUsers";
import { useSettings } from "@hooks/api/queries/useSettings";

import { EngineRow } from "../../../components/EngineRow";
import { SaveBar } from "../../../components/SaveBar";
import { SettingsCard } from "../../../components/SettingsCard";
import { useSettingsForm } from "../../../hooks/useSettingsForm";

export function ApprovalCard() {
  const { t } = useTranslation("settings");
  const settings = useSettings();
  const update = useUpdateUsers();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(settings.data?.users);

  if (!draft) return null;

  return (
    <SettingsCard title={t("members.approval.cardTitle")} description={t("members.approval.cardDescription")}>
      <EngineRow
        label={t("members.approval.requireForMembers.label")}
        description={t("members.approval.requireForMembers.description")}
        control={
          <Switch
            checked={draft.requireApprovalForMembers}
            onCheckedChange={(value) => setField("requireApprovalForMembers", value)}
            aria-label={t("members.approval.requireForMembers.label")}
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
