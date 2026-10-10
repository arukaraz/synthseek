"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { useNotificationAdminSettings, useUpdateNotificationAdminSettings } from "@hooks/api";

import { SaveBar } from "../../../components/SaveBar";
import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsField } from "../../../components/SettingsField";

export function MemberNtfyServerCard() {
  const { t } = useTranslation("settings");
  const settings = useNotificationAdminSettings();
  const update = useUpdateNotificationAdminSettings();
  const [draft, setDraft] = useState<string | null>(null);

  const saved = settings.data?.memberNtfyServer ?? "";
  const value = draft ?? saved;

  return (
    <SettingsCard
      title={t("notifications.memberServer.title")}
      optional
      description={t("notifications.memberServer.description")}
    >
      <SettingsField label={t("notifications.memberServer.label")} htmlFor="notification-member-ntfy">
        <Input
          id="notification-member-ntfy"
          value={value}
          placeholder={t("notifications.memberServer.placeholder")}
          disabled={!settings.data}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
        />
      </SettingsField>
      <SaveBar
        isDirty={draft !== null && draft !== saved}
        isSaving={update.isPending}
        onSave={() => update.mutate({ memberNtfyServer: value.trim() }, { onSuccess: () => setDraft(null) })}
        onCancel={() => setDraft(null)}
      />
    </SettingsCard>
  );
}
