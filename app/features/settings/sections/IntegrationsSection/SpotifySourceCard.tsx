"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { IconButton } from "@components/ui/IconButton";
import { Switch } from "@components/ui/Switch";
import { useUpdateConnectionsSpotify } from "@hooks/api/mutations/settings/useUpdateConnections";

import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { copyRow } from "../../styles";
import { buildRedirectUri } from "./helpers";
import { SpotifyRequirementsNotice } from "./SpotifyRequirementsNotice";
import { disabledOverlay, validationError } from "./styles";
import type { SpotifySourceCardProps } from "./types";

export function SpotifySourceCard({ spotify }: SpotifySourceCardProps) {
  const { t } = useTranslation("settings");
  const updateSpotify = useUpdateConnectionsSpotify();

  const [spotifyEnabled, setSpotifyEnabled] = useState(spotify.enabled);
  const [clientId, setClientId] = useState(spotify.clientId);
  const [publicBaseUrl, setPublicBaseUrl] = useState(spotify.publicBaseUrl);
  const [copied, setCopied] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const isDirty =
    spotifyEnabled !== spotify.enabled || clientId !== spotify.clientId || publicBaseUrl !== spotify.publicBaseUrl;

  const handleSave = async () => {
    if (spotifyEnabled && (!clientId.trim() || !publicBaseUrl.trim())) {
      setValidationMessage(t("metadata.librarySources.spotify.validationMissingFields"));
      return;
    }
    setValidationMessage(null);
    await updateSpotify.mutateAsync({ enabled: spotifyEnabled, clientId, publicBaseUrl });
  };

  const handleCancel = () => {
    setSpotifyEnabled(spotify.enabled);
    setClientId(spotify.clientId);
    setPublicBaseUrl(spotify.publicBaseUrl);
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
      toast.success(t("metadata.librarySources.spotify.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("metadata.librarySources.spotify.copyFailed"));
    }
  };

  return (
    <SettingsCard
      title={t("metadata.librarySources.spotify.title")}
      optional
      description={t("metadata.librarySources.spotify.description")}
      trailing={
        <Switch
          checked={spotifyEnabled}
          onCheckedChange={handleSpotifyEnabledChange}
          aria-label={t("metadata.librarySources.spotify.toggleAriaLabel")}
        />
      }
    >
      <div className={disabledOverlay({ disabled: !spotifyEnabled })}>
        <SpotifyRequirementsNotice />

        <SettingsField label={t("metadata.librarySources.spotify.clientIdLabel")}>
          <SettingsTextInput
            value={clientId}
            onChange={setClientId}
            placeholder={t("metadata.librarySources.spotify.clientIdPlaceholder")}
          />
        </SettingsField>

        <SettingsField
          label={t("metadata.librarySources.spotify.publicBaseUrlLabel")}
          helper={t("metadata.librarySources.spotify.publicBaseUrlHelper")}
        >
          <SettingsTextInput
            value={publicBaseUrl}
            onChange={setPublicBaseUrl}
            placeholder={t("metadata.librarySources.spotify.publicBaseUrlPlaceholder")}
            type="url"
          />
        </SettingsField>

        <SettingsField
          label={t("metadata.librarySources.spotify.redirectUriLabel")}
          helper={t("metadata.librarySources.spotify.redirectUriHelper")}
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
              aria-label={t("metadata.librarySources.spotify.copyAriaLabel")}
              title={t("metadata.librarySources.spotify.copyTitle")}
              animated={false}
            />
          </div>
        </SettingsField>
      </div>

      {validationMessage ? (
        <div className={validationError()} role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{validationMessage}</span>
        </div>
      ) : null}

      <SaveBar isDirty={isDirty} isSaving={updateSpotify.isPending} onSave={handleSave} onCancel={handleCancel} />
    </SettingsCard>
  );
}
