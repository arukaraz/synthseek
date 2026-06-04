"use client";

import { AlertCircle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("settings");
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
      setValidationMessage(t("metadata.librarySources.spotify.validationMissingFields"));
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
      toast.success(t("metadata.librarySources.spotify.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("metadata.librarySources.spotify.copyFailed"));
    }
  };

  return (
    <SettingsCard
      title={t("metadata.librarySources.title")}
      optional
      description={t("metadata.librarySources.description")}
    >
      <SettingsField
        label={t("metadata.librarySources.songlinkKey.label")}
        helper={t("metadata.librarySources.songlinkKey.helper")}
      >
        <SettingsSecretInput value={songlinkApiKey} onChange={setSonglinkApiKey} />
      </SettingsField>

      <section className={subSection()}>
        <header className={subSectionHeader()}>
          <div className={subSectionHeaderText()}>
            <h3 className={subSectionTitle()}>{t("metadata.librarySources.spotify.title")}</h3>
            <p className={subSectionDescription()}>{t("metadata.librarySources.spotify.subtitle")}</p>
          </div>
          <Switch
            checked={spotifyEnabled}
            onCheckedChange={handleSpotifyEnabledChange}
            aria-label={t("metadata.librarySources.spotify.toggleAriaLabel")}
          />
        </header>

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
