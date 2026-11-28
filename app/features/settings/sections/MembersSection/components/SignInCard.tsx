"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Notice } from "@components/ui/Notice";
import { Switch } from "@components/ui/Switch";
import { useUpdateAccountProvisioning, useUpdateOidcSignInMode } from "@hooks/api/mutations/settings/useOidcSettings";
import { useUpdateSignIn } from "@hooks/api/mutations/settings/useUpdateSignIn";
import { useOidcSignInMode } from "@hooks/api/queries/useOidcSignInMode";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useSignInMethods } from "@hooks/api/queries/useSignInMethods";

import { EngineRow } from "../../../components/EngineRow";
import { SettingsCard } from "../../../components/SettingsCard";
import { signInSwitchNote } from "../styles";

export function SignInCard() {
  const { t } = useTranslation("settings");
  const reasonId = useId();
  const { data: settings } = useSettings();
  const { data: mode } = useOidcSignInMode();
  const { data: methods } = useSignInMethods();
  const update = useUpdateSignIn();
  const updateMode = useUpdateOidcSignInMode();
  const updateProvisioning = useUpdateAccountProvisioning();
  const libraryCovers = settings?.signIn.libraryCovers;

  if (libraryCovers === undefined || settings === undefined) return null;

  const tested = mode !== undefined && mode.lastTestPassedAt !== null && settings.connections.oidc.enabled;
  const modeLocked = !tested || updateMode.isPending;
  const describedBy = tested ? undefined : reasonId;

  return (
    <SettingsCard
      title={t("members.signIn.cardTitle")}
      description={t("members.signIn.cardDescription")}
      anchor="signIn"
    >
      <EngineRow
        anchor="signIn.libraryCovers"
        label={t("members.signIn.libraryCovers.label")}
        description={t("members.signIn.libraryCovers.description")}
        control={
          <Switch
            checked={libraryCovers}
            disabled={update.isPending}
            onCheckedChange={(next) => update.mutate({ libraryCovers: next })}
            aria-label={t("members.signIn.libraryCovers.label")}
          />
        }
      />

      {mode ? (
        <>
          <EngineRow
            anchor="signIn.providerFirst"
            label={t("members.signIn.providerFirst.label")}
            description={t("members.signIn.providerFirst.description")}
            control={
              <Switch
                checked={mode.providerFirst}
                disabled={modeLocked}
                onCheckedChange={(next) => updateMode.mutate({ providerFirst: next, autoRedirect: mode.autoRedirect })}
                aria-label={t("members.signIn.providerFirst.label")}
                aria-describedby={describedBy}
              />
            }
          />
          <EngineRow
            anchor="signIn.autoRedirect"
            label={t("members.signIn.autoRedirect.label")}
            description={t("members.signIn.autoRedirect.description")}
            control={
              <Switch
                checked={mode.autoRedirect}
                disabled={modeLocked}
                onCheckedChange={(next) => updateMode.mutate({ providerFirst: mode.providerFirst, autoRedirect: next })}
                aria-label={t("members.signIn.autoRedirect.label")}
                aria-describedby={describedBy}
              />
            }
          />
          {tested ? null : (
            <p id={reasonId} className={signInSwitchNote()}>
              {t("members.signIn.needsTest")}
            </p>
          )}
          {mode.forcedLocal ? <Notice variant="warning" title={t("members.signIn.forcedLocal")} /> : null}
          {tested && methods ? (
            <Notice variant="info" title={t("members.signIn.lockout", { param: methods.localEscapeParam })} />
          ) : null}
        </>
      ) : null}

      <EngineRow
        anchor="signIn.accountCreation"
        label={t("members.signIn.accountCreation.label")}
        description={t("members.signIn.accountCreation.description")}
        control={
          <Switch
            checked={settings.accountProvisioning.enabled}
            disabled={updateProvisioning.isPending}
            onCheckedChange={(next) => updateProvisioning.mutate({ enabled: next })}
            aria-label={t("members.signIn.accountCreation.label")}
          />
        }
      />
    </SettingsCard>
  );
}
