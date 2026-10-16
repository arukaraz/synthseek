"use client";

import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { Pill } from "@features/settings/components/Pill";
import { SaveBar } from "@features/settings/components/SaveBar";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsSecretInput } from "@features/settings/components/SettingsSecretInput";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useSettingsForm } from "@features/settings/hooks/useSettingsForm";
import { useUpdateLastfm } from "@hooks/api/mutations/discovery/useUpdateLastfm";
import { useRevealSettingsSecret } from "@hooks/api/mutations/settings/useRevealSecret";
import { useUpdateConnectionsEnrichment } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { apiKeyWarningBox, disabledOverlay, feedPanel, feedPanelHeader, feedPanelTitle } from "../styles";
import type { LastfmCardProps } from "../types";

export function LastfmCard({ config, apiKeyConfigured }: LastfmCardProps) {
  const { t } = useTranslation("library");
  const update = useUpdateLastfm();
  const updateEnrichment = useUpdateConnectionsEnrichment();
  const reveal = useRevealSettingsSecret();
  const { isAdmin } = useAuthContext();
  const { data: settings } = useSettings({ enabled: isAdmin });
  const storedKey = settings?.connections.enrichment.lastfmApiKey;
  const storedSecret = settings?.connections.enrichment.lastfmApiSecret;
  const storedCredentials = useMemo(
    () =>
      storedKey === undefined || storedSecret === undefined
        ? undefined
        : { lastfmApiKey: storedKey, lastfmApiSecret: storedSecret },
    [storedKey, storedSecret]
  );
  const credentials = useSettingsForm(storedCredentials);

  const [enabled, setEnabled] = useState(config.enabled);
  const [username, setUsername] = useState(config.username ?? "");

  const feedsChanged = enabled !== config.enabled || username !== (config.username ?? "");
  const isDirty = feedsChanged || (isAdmin && credentials.isDirty);
  const isSaving = update.isPending || updateEnrichment.isPending;

  const handleSave = async () => {
    const tasks: Promise<unknown>[] = [];
    if (feedsChanged) tasks.push(update.mutateAsync({ enabled, username: username.trim() || null }));
    if (isAdmin && credentials.isDirty && settings && credentials.draft) {
      tasks.push(updateEnrichment.mutateAsync({ ...settings.connections.enrichment, ...credentials.draft }));
    }
    await Promise.all(tasks);
  };

  const handleCancel = () => {
    setEnabled(config.enabled);
    setUsername(config.username ?? "");
    credentials.reset();
  };

  return (
    <>
      <section className={feedPanel()} data-anchor-target="lastfm.feeds">
        <header className={feedPanelHeader()}>
          <span className={feedPanelTitle()}>
            {t("discoveryIntegrations.feedsTitle")}
            <InfoTooltip description={t("discoveryIntegrations.lastfm.tooltip")} />
          </span>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label={t("discoveryIntegrations.lastfm.enableAria")}
          />
        </header>

        {!apiKeyConfigured && !isAdmin ? (
          <div className={apiKeyWarningBox()}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t("discoveryIntegrations.lastfm.apiKeyWarning")}</span>
          </div>
        ) : null}

        <div className={disabledOverlay({ disabled: !enabled })}>
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
      </section>

      {isAdmin && credentials.draft ? (
        <section className={feedPanel()} data-anchor-target="lastfm.credentials">
          <header className={feedPanelHeader()}>
            <span className={feedPanelTitle()}>
              {t("discoveryIntegrations.lastfm.credentialsTitle")}
              <InfoTooltip description={t("discoveryIntegrations.lastfm.credentialsTooltip")} />
            </span>
            <Pill tone="info">{t("discoveryIntegrations.lastfm.adminBadge")}</Pill>
          </header>

          <SettingsField
            label={t("discoveryIntegrations.lastfm.apiKeyLabel")}
            helper={t("discoveryIntegrations.lastfm.apiKeyHelper")}
          >
            <SettingsSecretInput
              value={credentials.draft.lastfmApiKey}
              onChange={(value) => credentials.setField("lastfmApiKey", value)}
              source={{
                kind: "stored",
                reveal: () => reveal({ section: "connections.enrichment", field: "lastfmApiKey" }),
              }}
            />
          </SettingsField>

          <SettingsField
            label={t("discoveryIntegrations.lastfm.apiSecretLabel")}
            helper={t("discoveryIntegrations.lastfm.apiSecretHelper")}
          >
            <SettingsSecretInput
              value={credentials.draft.lastfmApiSecret}
              onChange={(value) => credentials.setField("lastfmApiSecret", value)}
              source={{
                kind: "stored",
                reveal: () => reveal({ section: "connections.enrichment", field: "lastfmApiSecret" }),
              }}
            />
          </SettingsField>
        </section>
      ) : null}

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
    </>
  );
}
