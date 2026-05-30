"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

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
            <InfoTooltip description="Recent scrobbles and lifetime top tracks from your Last.fm account. Feeds are fixed." />
          </span>
        </h3>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enable Last.fm" />
      </header>

      {!hasApiKey && !isAdmin ? (
        <div className={apiKeyWarningBox()}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Last.fm API key is not configured. Ask your administrator to set it before enabling this integration.
          </span>
        </div>
      ) : null}

      <div className={disabledOverlay({ disabled: !enabled })}>
        {isAdmin ? (
          <SettingsField label="API key" helper="System-wide Last.fm API key. Shared across all users.">
            <SettingsSecretInput value={apiKey} onChange={setApiKey} />
          </SettingsField>
        ) : null}

        <SettingsField label="Username" helper="Your public Last.fm username.">
          <SettingsTextInput value={username} onChange={setUsername} placeholder="e.g. yourname" />
        </SettingsField>
      </div>

      <div className={subSectionSaveBar()}>
        <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
      </div>
    </section>
  );
}
