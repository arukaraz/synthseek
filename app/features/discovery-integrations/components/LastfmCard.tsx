"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { SaveBar } from "@features/settings/components/SaveBar";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsSecretInput } from "@features/settings/components/SettingsSecretInput";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useUpdateLastfm } from "@hooks/api/mutations/discovery/useUpdateLastfm";
import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useAuthContext } from "@modules/providers/AuthProvider";

import {
  apiKeyWarningBox,
  disabledOverlay,
  subSection,
  subSectionHeader,
  subSectionSaveBar,
  subSectionTitle,
} from "../styles";
import type { LastfmCardProps } from "../types";

export function LastfmCard({ config }: LastfmCardProps) {
  const { t } = useTranslation("library");
  const update = useUpdateLastfm();
  const updateEnrichment = useUpdateConnectionsEnrichment();
  const { data: settings } = useSettings();
  const { isAdmin } = useAuthContext();

  const [enabled, setEnabled] = useState(config.enabled);
  const [username, setUsername] = useState(config.username ?? "");
  const [apiKey, setApiKey] = useState(settings?.connections.enrichment.lastfmApiKey ?? "");

  const persistedApiKey = settings?.connections.enrichment.lastfmApiKey ?? "";
  const hasApiKey = Boolean(persistedApiKey);

  const isDirty =
    enabled !== config.enabled || username !== (config.username ?? "") || (isAdmin && apiKey !== persistedApiKey);

  const isSaving = update.isPending || updateEnrichment.isPending;

  const handleSave = async () => {
    const tasks: Promise<unknown>[] = [];
    if (enabled !== config.enabled || username !== (config.username ?? "")) {
      tasks.push(update.mutateAsync({ enabled, username: username.trim() || null }));
    }
    if (isAdmin && apiKey !== persistedApiKey && settings) {
      tasks.push(updateEnrichment.mutateAsync({ ...settings.connections.enrichment, lastfmApiKey: apiKey }));
    }
    await Promise.all(tasks);
  };

  const handleCancel = () => {
    setEnabled(config.enabled);
    setUsername(config.username ?? "");
    setApiKey(persistedApiKey);
  };

  return (
    <section className={subSection()} data-anchor-target="lastfm">
      <header className={subSectionHeader()}>
        <h3 className={subSectionTitle()}>
          <span className="inline-flex items-center gap-1.5">
            Last.fm
            <InfoTooltip description={t("discoveryIntegrations.lastfm.tooltip")} />
          </span>
        </h3>
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label={t("discoveryIntegrations.lastfm.enableAria")}
        />
      </header>

      {!hasApiKey && !isAdmin ? (
        <div className={apiKeyWarningBox()}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{t("discoveryIntegrations.lastfm.apiKeyWarning")}</span>
        </div>
      ) : null}

      <div className={disabledOverlay({ disabled: !enabled })}>
        {isAdmin ? (
          <SettingsField
            label={t("discoveryIntegrations.lastfm.apiKeyLabel")}
            helper={t("discoveryIntegrations.lastfm.apiKeyHelper")}
          >
            <SettingsSecretInput value={apiKey} onChange={setApiKey} />
          </SettingsField>
        ) : null}

        <SettingsField
          label={t("discoveryIntegrations.lastfm.usernameLabel")}
          helper={t("discoveryIntegrations.lastfm.usernameHelper")}
        >
          <SettingsTextInput
            value={username}
            onChange={setUsername}
            placeholder={t("discoveryIntegrations.lastfm.usernamePlaceholder")}
          />
        </SettingsField>
      </div>

      <div className={subSectionSaveBar()}>
        <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </section>
  );
}
