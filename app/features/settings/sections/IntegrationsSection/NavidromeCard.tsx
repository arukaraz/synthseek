"use client";

import { Plug } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { useTestNavidrome, useUpdateConnectionsNavidrome } from "@hooks/api/mutations/settings/useUpdateConnections";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { SERVER_TEST_OUTCOME_KEYS } from "./constants";
import { pathsNotice } from "./styles";
import type { NavidromeCardProps } from "./types";

export function NavidromeCard({ initial }: NavidromeCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateConnectionsNavidrome();
  const testConnection = useTestNavidrome();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  const complete = Boolean(draft.url.trim() && draft.username.trim() && draft.password);

  const handleTest = async () => {
    const result = await testConnection.mutateAsync({
      url: draft.url.trim(),
      username: draft.username.trim(),
      password: draft.password,
    });
    const message = t(SERVER_TEST_OUTCOME_KEYS[result.outcome]);
    if (result.outcome === "ok") toast.success(message);
    else toast.error(message);
  };

  const handleSave = () =>
    save((payload) => update.mutateAsync({ ...payload, url: payload.url.trim(), username: payload.username.trim() }));

  return (
    <SettingsCard title={t("mediaServers.navidrome.title")} description={t("mediaServers.navidrome.description")}>
      <SettingsField label={t("mediaServers.url")}>
        <SettingsTextInput
          value={draft.url}
          onChange={(value) => setField("url", value)}
          placeholder={t("mediaServers.navidrome.urlPlaceholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField label={t("mediaServers.navidrome.username")}>
        <SettingsTextInput value={draft.username} onChange={(value) => setField("username", value)} />
      </SettingsField>

      <SettingsField label={t("mediaServers.navidrome.password")}>
        <SettingsSecretInput value={draft.password} onChange={(value) => setField("password", value)} />
      </SettingsField>

      <EngineRow
        label={t("mediaServers.playback.label", { server: t("mediaServers.navidrome.title") })}
        description={t("mediaServers.playback.description")}
        control={
          <Switch
            checked={draft.playback}
            onCheckedChange={(value) => setField("playback", value)}
            aria-label={t("mediaServers.playback.label", { server: t("mediaServers.navidrome.title") })}
          />
        }
      />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleTest} disabled={testConnection.isPending || !complete}>
          <Plug className="size-4" />
          {testConnection.isPending ? t("mediaServers.test.testing") : t("mediaServers.test.action")}
        </Button>
      </div>
      {testConnection.data?.realPaths === false ? (
        <p className={pathsNotice()}>{t("mediaServers.navidrome.syntheticPaths")}</p>
      ) : null}

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={reset} />
    </SettingsCard>
  );
}
