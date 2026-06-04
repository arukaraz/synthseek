"use client";

import { Plug } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";

import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSlskdStatus } from "@hooks/api/queries/useSlskdStatus";
import { validateSlskdApiUrl } from "@utils/slskd-url";
import { ListManager } from "../../components/ListManager";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, fieldError, fieldWarning } from "../../styles";
import { SlskdStatusBadge } from "./SlskdStatusBadge";
import type { SlskdCardProps } from "./types";

export function SlskdCard({ initial }: SlskdCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateConnectionsSlskd();
  const testConnection = useTestSlskd();
  const status = useSlskdStatus();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);
  const [testing, setTesting] = useState(false);

  if (!draft) return null;

  const urlCheck = validateSlskdApiUrl(draft.apiUrl);
  const urlError = draft.apiUrl.length > 0 && !urlCheck.ok ? urlCheck.error : undefined;
  const urlWarning = urlCheck.ok ? urlCheck.warning : undefined;

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testConnection.mutateAsync({ apiUrl: urlCheck.normalized, apiKey: draft.apiKey });
      if (result.ok) toast.success(result.message ?? t("slskd.connected"));
      else toast.error(result.message ?? t("slskd.connectionFailed"));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setField("apiUrl", urlCheck.normalized);
    return save((payload) => update.mutateAsync({ ...payload, apiUrl: urlCheck.normalized }));
  };

  return (
    <SettingsCard
      title={t("slskd.title")}
      description={t("slskd.description")}
      trailing={
        status.data ? (
          <SlskdStatusBadge
            status={status.data.status}
            message={status.data.message !== "Connected" ? status.data.message : undefined}
            messageCode={status.data.messageCode !== "SLSKD_CONNECTED" ? status.data.messageCode : undefined}
            messageParams={status.data.messageParams}
          />
        ) : null
      }
    >
      <SettingsField label={t("slskd.apiUrl.label")} helper="">
        <SettingsTextInput
          value={draft.apiUrl}
          onChange={(v) => setField("apiUrl", v)}
          placeholder={t("slskd.apiUrl.placeholder")}
          type="url"
        />
        {urlError ? (
          <p role="alert" className={fieldError()}>
            {urlError}
          </p>
        ) : urlWarning ? (
          <p className={fieldWarning()}>{urlWarning}</p>
        ) : null}
      </SettingsField>

      <SettingsField label={t("slskd.apiKey.label")}>
        <SettingsSecretInput value={draft.apiKey} onChange={(v) => setField("apiKey", v)} />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testing || !draft.apiUrl || !draft.apiKey || Boolean(urlError)}
        >
          <Plug className="size-4" />
          {testing ? t("slskd.testing") : t("slskd.testConnection")}
        </Button>
      </div>

      <div role="separator" className={cardDivider()} />

      <SettingsField
        label={t("slskd.bannedUploaders.label")}
        contentSpacing="loose"
        labelTrailing={
          <InfoTooltip
            description={t("slskd.bannedUploaders.tooltipWhat")}
            secondary={t("slskd.bannedUploaders.tooltipAuto")}
            triggerLabel={t("slskd.bannedUploaders.tooltipTriggerLabel")}
          />
        }
      >
        <ListManager
          value={draft.bannedUsers}
          onChange={(v) => setField("bannedUsers", v)}
          addPlaceholder={t("slskd.bannedUploaders.addPlaceholder")}
          filterPlaceholder={t("slskd.bannedUploaders.filterPlaceholder")}
          emptyLabel={t("slskd.bannedUploaders.empty")}
          countLabel={(n) => t("slskd.bannedUploaders.count", { count: n })}
          helper={
            <Trans
              t={t}
              i18nKey="slskd.bannedUploaders.helper"
              components={{
                link: (
                  <Link
                    href="/settings/engine#ban-threshold"
                    className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
                  />
                ),
              }}
            />
          }
        />
      </SettingsField>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        saveDisabled={Boolean(urlError)}
        onSave={handleSave}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
