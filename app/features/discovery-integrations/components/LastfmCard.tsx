"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { HashLink, inlineLink } from "@components/HashLink";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { SaveBar } from "@features/settings/components/SaveBar";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useUpdateLastfm } from "@hooks/api/mutations/discovery/useUpdateLastfm";
import { useAuthContext } from "@modules/providers/AuthProvider";

import {
  apiKeyWarningBox,
  disabledOverlay,
  feedPanel,
  feedPanelHeader,
  feedPanelNote,
  feedPanelTitle,
} from "../styles";
import type { LastfmCardProps } from "../types";

export function LastfmCard({ config, apiKeyConfigured }: LastfmCardProps) {
  const { t } = useTranslation("library");
  const update = useUpdateLastfm();
  const { isAdmin } = useAuthContext();

  const [enabled, setEnabled] = useState(config.enabled);
  const [username, setUsername] = useState(config.username ?? "");

  const isDirty = enabled !== config.enabled || username !== (config.username ?? "");

  const handleSave = async () => {
    await update.mutateAsync({ enabled, username: username.trim() || null });
  };

  const handleCancel = () => {
    setEnabled(config.enabled);
    setUsername(config.username ?? "");
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

        {isAdmin ? (
          <span className={feedPanelNote()}>
            <Trans
              t={t}
              i18nKey="discoveryIntegrations.lastfm.credentialsElsewhere"
              components={{
                metadata: (
                  <HashLink href="/settings/metadata#connections.enrichment.lastfmApiKey" className={inlineLink()} />
                ),
              }}
            />
          </span>
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

      <SaveBar isDirty={isDirty} isSaving={update.isPending} onSave={handleSave} onCancel={handleCancel} />
    </>
  );
}
