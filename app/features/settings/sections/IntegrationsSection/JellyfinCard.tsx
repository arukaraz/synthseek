"use client";

import { Plug } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { useTestJellyfin, useUpdateConnectionsJellyfin } from "@hooks/api/mutations/settings/useUpdateConnections";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { SERVER_TEST_OUTCOME_KEYS } from "./constants";
import type { JellyfinCardProps } from "./types";

export function JellyfinCard({ initial }: JellyfinCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateConnectionsJellyfin();
  const testConnection = useTestJellyfin();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  const complete = Boolean(draft.url.trim() && draft.apiKey);

  const handleTest = async () => {
    const result = await testConnection.mutateAsync({ url: draft.url.trim(), apiKey: draft.apiKey });
    const message = t(SERVER_TEST_OUTCOME_KEYS[result.outcome]);
    if (result.outcome === "ok") toast.success(message);
    else toast.error(message);
  };

  const handleSave = () => save((payload) => update.mutateAsync({ ...payload, url: payload.url.trim() }));

  return (
    <SettingsCard title={t("mediaServers.jellyfin.title")} description={t("mediaServers.jellyfin.description")}>
      <SettingsField label={t("mediaServers.url")}>
        <SettingsTextInput
          value={draft.url}
          onChange={(value) => setField("url", value)}
          placeholder={t("mediaServers.jellyfin.urlPlaceholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField label={t("mediaServers.jellyfin.apiKey")} helper={t("mediaServers.jellyfin.apiKeyHelper")}>
        <SettingsSecretInput value={draft.apiKey} onChange={(value) => setField("apiKey", value)} />
      </SettingsField>

      <EngineRow
        label={t("mediaServers.playback.label", { server: t("mediaServers.jellyfin.title") })}
        description={t("mediaServers.playback.description")}
        control={
          <Switch
            checked={draft.playback}
            onCheckedChange={(value) => setField("playback", value)}
            aria-label={t("mediaServers.playback.label", { server: t("mediaServers.jellyfin.title") })}
          />
        }
      />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleTest} disabled={testConnection.isPending || !complete}>
          <Plug className="size-4" />
          {testConnection.isPending ? t("mediaServers.test.testing") : t("mediaServers.test.action")}
        </Button>
      </div>

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={reset} />
    </SettingsCard>
  );
}
