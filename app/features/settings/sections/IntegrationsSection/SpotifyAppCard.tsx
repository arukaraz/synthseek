"use client";

import { useUpdateConnectionsSpotify } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

import { buildRedirectUri } from "./helpers";
import { SpotifyRequirementsNotice } from "./SpotifyRequirementsNotice";
import type { SpotifyAppCardProps } from "./types";

export function SpotifyAppCard({ initial }: SpotifyAppCardProps) {
  const update = useUpdateConnectionsSpotify();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  const redirectUri = buildRedirectUri(draft.publicBaseUrl);

  return (
    <SettingsCard title="Spotify" description="Configure the Spotify App used to authorize each user's library.">
      <SpotifyRequirementsNotice />

      <SettingsField
        label="Client ID"
        helper="Found in your Spotify Developer Dashboard. Each user uses this same Client ID via PKCE, no client secret needed."
      >
        <SettingsTextInput
          value={draft.clientId}
          onChange={(v) => setField("clientId", v)}
          placeholder="e.g. 3a1b6c5d7e8f4a..."
        />
      </SettingsField>

      <SettingsField label="Public Base URL" helper="Your Synthseek public URL (no trailing slash).">
        <SettingsTextInput
          value={draft.publicBaseUrl}
          onChange={(v) => setField("publicBaseUrl", v)}
          placeholder="https://synthseek.example.com"
          type="url"
        />
      </SettingsField>

      <SettingsField label="Redirect URI" helper="Paste this URI exactly into your Spotify App's 'Redirect URIs' list.">
        <SettingsTextInput value={redirectUri} onChange={() => undefined} disabled />
      </SettingsField>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
