"use client";

import { Plug } from "lucide-react";
import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";

import { useTestSubsonicSource, useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
import { useRevealSettingsSecret } from "@hooks/api/mutations/settings/useRevealSecret";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { MS, SUBSONIC_SOURCE_TEST_KEYS } from "./constants";
import { withoutPriority } from "./helpers";
import type { SubsonicSourceCardProps } from "./types";

export function SubsonicSourceCard({ initial }: SubsonicSourceCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const testConnection = useTestSubsonicSource();
  const reveal = useRevealSettingsSecret();
  const stored = useMemo(() => withoutPriority(initial.subsonic), [initial.subsonic]);
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(stored);
  const fieldId = useId();

  if (!draft) return null;

  const credentials = {
    url: draft.url,
    username: draft.username.trim(),
    password: draft.password,
    apiKey: draft.apiKey,
  };
  const complete = Boolean(credentials.url && (credentials.apiKey || (credentials.username && credentials.password)));

  const handleTest = async () => {
    const result = await testConnection.mutateAsync(credentials);
    const message = t(SUBSONIC_SOURCE_TEST_KEYS[result.outcome]);
    if (result.outcome === "ok") toast.success(message);
    else toast.error(message, result.reason === null ? undefined : { description: result.reason });
  };

  return (
    <SettingsCard
      title={t("subsonicSource.title")}
      optional
      description={t("subsonicSource.description")}
      anchor="subsonic"
    >
      <EngineRow
        label={t("subsonicSource.enable.label")}
        description={t("subsonicSource.enable.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("subsonicSource.enable.ariaLabel")}
          />
        }
      />

      <SettingsField
        label={t("subsonicSource.url")}
        helper={t("subsonicSource.urlHint")}
        htmlFor={`${fieldId}-url`}
        anchor="downloadSources.subsonic.url"
      >
        <SettingsTextInput
          id={`${fieldId}-url`}
          value={draft.url}
          onChange={(value) => setField("url", value)}
          placeholder={t("subsonicSource.urlPlaceholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField
        label={t("subsonicSource.apiKey")}
        helper={t("subsonicSource.apiKeyHint")}
        htmlFor={`${fieldId}-api-key`}
        anchor="downloadSources.subsonic.apiKey"
      >
        <SettingsSecretInput
          id={`${fieldId}-api-key`}
          value={draft.apiKey}
          onChange={(value) => setField("apiKey", value)}
          source={{ kind: "stored", reveal: () => reveal({ section: "downloadSources.subsonic", field: "apiKey" }) }}
        />
      </SettingsField>

      <SettingsField label={t("subsonicSource.username")} htmlFor={`${fieldId}-username`}>
        <SettingsTextInput
          id={`${fieldId}-username`}
          value={draft.username}
          onChange={(value) => setField("username", value)}
        />
      </SettingsField>

      <SettingsField label={t("subsonicSource.password")} htmlFor={`${fieldId}-password`}>
        <SettingsSecretInput
          id={`${fieldId}-password`}
          value={draft.password}
          onChange={(value) => setField("password", value)}
          source={{ kind: "stored", reveal: () => reveal({ section: "downloadSources.subsonic", field: "password" }) }}
        />
      </SettingsField>

      <EngineRow
        anchor="downloadSources.subsonic.searchTimeout"
        label={t("subsonicSource.searchTimeout.label")}
        description={t("subsonicSource.searchTimeout.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.searchTimeout / MS)}
            onChange={(v) => setField("searchTimeout", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t("subsonicSource.searchTimeout.ariaLabel")}
          />
        }
      />

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleTest} disabled={testConnection.isPending || !complete}>
          <Plug className="size-4" />
          {testConnection.isPending ? t("subsonicSource.test.testing") : t("subsonicSource.test.action")}
        </Button>
      </div>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() =>
          save((subsonic) => update.mutateAsync({ subsonic: { ...subsonic, username: subsonic.username.trim() } }))
        }
        onCancel={reset}
      />
    </SettingsCard>
  );
}
