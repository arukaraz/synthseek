"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Notice } from "@components/ui/Notice";
import { Switch } from "@components/ui/Switch";
import { useUpdateConnectionsOidc } from "@hooks/api/mutations/settings/useOidcSettings";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useSettings } from "@hooks/api/queries/useSettings";

import { EngineRow } from "../../../components/EngineRow";
import { SaveBar } from "../../../components/SaveBar";
import { SettingsCard } from "../../../components/SettingsCard";
import { SettingsField } from "../../../components/SettingsField";
import { SettingsSecretInput } from "../../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../../components/SettingsTextInput";
import { TYPED_SECRET } from "../../../components/constants";
import { useSettingsForm } from "../../../hooks/useSettingsForm";
import { ConnectionValueField } from "../../GeneralSection/ConnectionValueField";
import { publicEndpoint } from "../../GeneralSection/helpers";
import { OIDC_CALLBACK_PATH } from "../constants";
import { oidcFormSeed, oidcSecretToSend } from "../helpers";
import { OidcTestRow } from "./OidcTestRow";

export function OidcProviderCard() {
  const { t } = useTranslation("settings");
  const settings = useSettings();
  const publicConfig = usePublicConfig();
  const update = useUpdateConnectionsOidc();
  const stored = settings.data?.connections.oidc;
  const seed = useMemo(() => (stored ? oidcFormSeed(stored) : undefined), [stored]);
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(seed);

  if (!draft || !stored) return null;

  const secretStored = stored.clientSecret !== "";
  const publicBaseUrl = publicConfig.data?.publicBaseUrl ?? "";
  const configured = stored.issuerUrl !== "" && stored.clientId !== "";

  const handleSave = () =>
    save(async (payload) => {
      await update.mutateAsync({ ...payload, clientSecret: oidcSecretToSend(payload.clientSecret, secretStored) });
      setField("clientSecret", "");
    });

  return (
    <SettingsCard title={t("members.oidc.cardTitle")} description={t("members.oidc.cardDescription")} anchor="oidc">
      <EngineRow
        anchor="oidc.enabled"
        label={t("members.oidc.enabled.label")}
        description={t("members.oidc.enabled.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(value) => setField("enabled", value)}
            aria-label={t("members.oidc.enabled.label")}
          />
        }
      />

      <SettingsField
        label={t("members.oidc.issuerUrl.label")}
        helper={t("members.oidc.issuerUrl.helper")}
        anchor="oidc.issuerUrl"
      >
        <SettingsTextInput
          type="url"
          value={draft.issuerUrl}
          onChange={(value) => setField("issuerUrl", value)}
          placeholder={t("members.oidc.issuerUrl.placeholder")}
          autoComplete="off"
        />
      </SettingsField>

      <SettingsField label={t("members.oidc.clientId.label")} anchor="oidc.clientId">
        <SettingsTextInput
          value={draft.clientId}
          onChange={(value) => setField("clientId", value)}
          autoComplete="off"
        />
      </SettingsField>

      <SettingsField
        label={t("members.oidc.clientSecret.label")}
        helper={t("members.oidc.clientSecret.helper")}
        anchor="oidc.clientSecret"
      >
        <SettingsSecretInput
          value={draft.clientSecret}
          onChange={(value) => setField("clientSecret", value)}
          source={TYPED_SECRET}
          placeholder={secretStored ? t("members.oidc.clientSecret.storedPlaceholder") : undefined}
          autoComplete="new-password"
        />
      </SettingsField>

      <SettingsField label={t("members.oidc.scopes.label")} helper={t("members.oidc.scopes.helper")}>
        <SettingsTextInput value={draft.scopes} onChange={(value) => setField("scopes", value)} autoComplete="off" />
      </SettingsField>

      <SettingsField label={t("members.oidc.buttonLabel.label")} helper={t("members.oidc.buttonLabel.helper")}>
        <SettingsTextInput
          value={draft.buttonLabel}
          onChange={(value) => setField("buttonLabel", value)}
          placeholder={t("members.oidc.buttonLabel.placeholder")}
          autoComplete="off"
        />
      </SettingsField>

      {publicBaseUrl ? (
        <ConnectionValueField
          label={t("members.oidc.callback.label")}
          helper={t("members.oidc.callback.helper")}
          value={publicEndpoint(OIDC_CALLBACK_PATH, publicBaseUrl)}
          copyAriaLabel={t("members.oidc.callback.copyAriaLabel")}
          copiedMessage={t("members.oidc.callback.copied")}
          copyFailedMessage={t("members.oidc.callback.copyFailed")}
        />
      ) : publicConfig.data ? (
        <Notice variant="warning" title={t("members.oidc.callback.missing")} />
      ) : null}

      <OidcTestRow dirty={isDirty} configured={configured} lastPassedAt={stored.lastTestPassedAt} />

      <SaveBar isDirty={isDirty} isSaving={isSaving} onSave={handleSave} onCancel={reset} />
    </SettingsCard>
  );
}
