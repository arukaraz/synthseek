"use client";

import { Plug } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";

import { useTestLidarr, useUpdateConnectionsLidarr } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useLidarrStatus } from "@hooks/api/queries/useLidarrStatus";
import { validateLidarrUrl } from "@utils/lidarr-url";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { fieldError, fieldWarning } from "../../styles";
import { LidarrStatusBadge } from "./LidarrStatusBadge";
import type { LidarrCardProps } from "./types";

export function LidarrCard({ initial }: LidarrCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateConnectionsLidarr();
  const testConnection = useTestLidarr();
  const status = useLidarrStatus();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);
  const [testing, setTesting] = useState(false);

  if (!draft) return null;

  const urlCheck = validateLidarrUrl(draft.url);
  const urlError = draft.url.length > 0 && !urlCheck.ok ? urlCheck.error : undefined;
  const urlWarning = urlCheck.ok ? urlCheck.warning : undefined;

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testConnection.mutateAsync({ url: urlCheck.normalized, apiKey: draft.apiKey });
      if (result.ok) toast.success(result.message ?? t("lidarr.connected"));
      else toast.error(result.message ?? t("lidarr.connectionFailed"));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setField("url", urlCheck.normalized);
    return save((payload) => update.mutateAsync({ ...payload, url: urlCheck.normalized }));
  };

  return (
    <SettingsCard
      title={t("lidarr.title")}
      description={t("lidarr.description")}
      trailing={
        status.data ? (
          <LidarrStatusBadge
            status={status.data.status}
            message={status.data.message !== "Connected" ? status.data.message : undefined}
            messageCode={status.data.messageCode !== "LIDARR_CONNECTED" ? status.data.messageCode : undefined}
            messageParams={status.data.messageParams}
          />
        ) : null
      }
    >
      <SettingsField label={t("lidarr.url.label")} helper="">
        <SettingsTextInput
          value={draft.url}
          onChange={(v) => setField("url", v)}
          placeholder={t("lidarr.url.placeholder")}
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

      <SettingsField label={t("lidarr.apiKey.label")}>
        <SettingsSecretInput value={draft.apiKey} onChange={(v) => setField("apiKey", v)} />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testing || !draft.url || !draft.apiKey || Boolean(urlError)}
        >
          <Plug className="size-4" />
          {testing ? t("lidarr.testing") : t("lidarr.testConnection")}
        </Button>
      </div>

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
