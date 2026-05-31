"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { IconButton } from "@components/ui/IconButton";
import { Switch } from "@components/ui/Switch";
import {
  useUpdateConnectionsEnrichment,
  useUpdateConnectionsSpotify,
} from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import {
  copyRow,
  subSection,
  subSectionDescription,
  subSectionHeader,
  subSectionHeaderText,
  subSectionTitle,
} from "../../styles";
import { buildRedirectUri } from "./helpers";
import { SpotifyRequirementsNotice } from "./SpotifyRequirementsNotice";
import { disabledOverlay, validationError } from "./styles";
import type { LibrarySourcesCardProps } from "./types";

export function LibrarySourcesCard({ spotify, enrichment }: LibrarySourcesCardProps) {
  const updateSpotify = useUpdateConnectionsSpotify();
  const updateEnrichment = useUpdateConnectionsEnrichment();

  const [spotifyEnabled, setSpotifyEnabled] = useState(spotify.enabled);
  const [clientId, setClientId] = useState(spotify.clientId);
  const [publicBaseUrl, setPublicBaseUrl] = useState(spotify.publicBaseUrl);
  const [songlinkApiKey, setSonglinkApiKey] = useState(enrichment.songlinkApiKey);
  const [copied, setCopied] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const isDirty =
    spotifyEnabled !== spotify.enabled ||
    clientId !== spotify.clientId ||
    publicBaseUrl !== spotify.publicBaseUrl ||
    songlinkApiKey !== enrichment.songlinkApiKey;

  const isSaving = updateSpotify.isPending || updateEnrichment.isPending;

  const handleSave = async () => {
    if (spotifyEnabled && (!clientId.trim() || !publicBaseUrl.trim())) {
      setValidationMessage(
        "Spotify is enabled but missing required fields. Fill in Client ID and Public Base URL, or disable the toggle."
      );
      return;
    }
    setValidationMessage(null);
    const tasks: Promise<unknown>[] = [];
    if (
      spotifyEnabled !== spotify.enabled ||
      clientId !== spotify.clientId ||
      publicBaseUrl !== spotify.publicBaseUrl
    ) {
      tasks.push(updateSpotify.mutateAsync({ enabled: spotifyEnabled, clientId, publicBaseUrl }));
    }
    if (songlinkApiKey !== enrichment.songlinkApiKey) {
      tasks.push(updateEnrichment.mutateAsync({ ...enrichment, songlinkApiKey }));
    }
    await Promise.all(tasks);
  };

  const handleCancel = () => {
    setSpotifyEnabled(spotify.enabled);
    setClientId(spotify.clientId);
    setPublicBaseUrl(spotify.publicBaseUrl);
    setSonglinkApiKey(enrichment.songlinkApiKey);
    setValidationMessage(null);
  };

  const handleSpotifyEnabledChange = (next: boolean) => {
    setSpotifyEnabled(next);
    if (!next) setValidationMessage(null);
  };

  const redirectUri = buildRedirectUri(publicBaseUrl);

  const handleCopyRedirect = async () => {
    if (!redirectUri) return;
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      toast.success("Redirect URI copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy redirect URI");
    }
  };

  return (
    <SettingsCard
      title="Library Sources"
      optional
      description="Streaming platforms that Synthseek can import playlists and saved albums from."
    >
      <SettingsField
        label="Songlink API key (optional)"
        helper="Resolves track URLs across platforms for cross-platform playlist imports. Synthseek uses the public endpoint by default. Leave blank unless you have a key."
      >
        <SettingsSecretInput value={songlinkApiKey} onChange={setSonglinkApiKey} />
      </SettingsField>

      <section className={subSection()}>
        <header className={subSectionHeader()}>
          <div className={subSectionHeaderText()}>
            <h3 className={subSectionTitle()}>Spotify</h3>
            <p className={subSectionDescription()}>Developer&apos;s app configuration</p>
          </div>
          <Switch checked={spotifyEnabled} onCheckedChange={handleSpotifyEnabledChange} aria-label="Enable Spotify" />
        </header>

        <div className={disabledOverlay({ disabled: !spotifyEnabled })}>
          <SpotifyRequirementsNotice />

          <SettingsField label="Client ID">
            <SettingsTextInput value={clientId} onChange={setClientId} placeholder="e.g. 3a1b6c5d7e8f4a..." />
          </SettingsField>

          <SettingsField label="Public Base URL" helper="Your Synthseek URL (no trailing slash).">
            <SettingsTextInput
              value={publicBaseUrl}
              onChange={setPublicBaseUrl}
              placeholder="https://synthseek.example.com"
              type="url"
            />
          </SettingsField>

          <SettingsField
            label="Redirect URI"
            helper="Paste this URI exactly into your Spotify App's 'Redirect URIs' list."
          >
            <div className={copyRow()}>
              <div className="flex-1">
                <SettingsTextInput value={redirectUri} onChange={() => undefined} disabled />
              </div>
              <IconButton
                icon={copied ? Check : Copy}
                variant="accent"
                size="md"
                onClick={handleCopyRedirect}
                disabled={!redirectUri}
                aria-label="Copy redirect URI"
                title="Copy redirect URI"
                animated={false}
              />
            </div>
          </SettingsField>
        </div>
      </section>

      {validationMessage ? (
        <div className={validationError()} role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{validationMessage}</span>
        </div>
      ) : null}

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
    </SettingsCard>
  );
}
