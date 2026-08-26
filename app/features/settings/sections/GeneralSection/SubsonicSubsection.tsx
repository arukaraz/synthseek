"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { Switch } from "@components/ui/Switch";
import { useUpdateConnectApps } from "@hooks/api/mutations/settings/useUpdateConnectApps";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useSubsonicCredentials } from "@hooks/api/queries/useSubsonicCredentials";
import { useSubsonicStatus } from "@hooks/api/queries/useSubsonicStatus";
import { useAuthContext } from "@modules/providers/AuthProvider";

import {
  subSection,
  subSectionDescription,
  subSectionHeader,
  subSectionHeaderText,
  subSectionTitle,
} from "../../styles";
import { ConnectionValueField } from "./ConnectionValueField";
import { CreateSubsonicCredentialDialog } from "./CreateSubsonicCredentialDialog";
import { publicEndpoint } from "./helpers";
import { connectionBody, connectionMeta } from "./styles";
import { SubsonicCredentialRow } from "./SubsonicCredentialRow";

export function SubsonicSubsection() {
  const { t } = useTranslation("settings");
  const { currentUser, isAdmin } = useAuthContext();
  const status = useSubsonicStatus();
  const credentials = useSubsonicCredentials();
  const publicConfig = usePublicConfig();
  const updateConnectApps = useUpdateConnectApps();
  const [createOpen, setCreateOpen] = useState(false);

  const enabled = status.data?.enabled ?? false;
  const address = publicEndpoint(
    status.data?.basePath ?? "/api/v1/subsonic",
    publicConfig.data?.publicBaseUrl || undefined
  );

  return (
    <section className={subSection()}>
      <header className={subSectionHeader()}>
        <div className={subSectionHeaderText()}>
          <h3 className={subSectionTitle()}>{t("subsonic.title")}</h3>
          <p className={subSectionDescription()}>{t("subsonic.description")}</p>
        </div>
        {isAdmin ? (
          <Switch
            checked={enabled}
            onCheckedChange={(next) => updateConnectApps.mutate({ subsonicEnabled: next })}
            disabled={status.isLoading || updateConnectApps.isPending}
            aria-label={t("subsonic.enable.ariaLabel")}
          />
        ) : null}
      </header>

      <div className={connectionBody()}>
        {enabled ? (
          <>
            <ConnectionValueField
              label={t("subsonic.connect.addressLabel")}
              value={address}
              copyAriaLabel={t("subsonic.connect.copyAddressLabel")}
              copiedMessage={t("subsonic.connect.addressCopied")}
              copyFailedMessage={t("subsonic.connect.copyFailed")}
            />

            <ConnectionValueField
              label={t("subsonic.connect.usernameLabel")}
              value={currentUser?.username ?? ""}
              helper={t("subsonic.connect.passwordHelper")}
              copyAriaLabel={t("subsonic.connect.copyUsernameLabel")}
              copiedMessage={t("subsonic.connect.usernameCopied")}
              copyFailedMessage={t("subsonic.connect.copyFailed")}
            />
          </>
        ) : (
          <span className={connectionMeta()}>
            {isAdmin ? t("subsonic.disabled.admin") : t("subsonic.disabled.member")}
          </span>
        )}

        {credentials.isLoading ? (
          <span className={connectionMeta()}>{t("subsonic.credentials.loading")}</span>
        ) : credentials.error ? (
          <span className="text-xs text-red-400">
            {t("subsonic.credentials.loadError", { message: credentials.error.message })}
          </span>
        ) : credentials.data && credentials.data.length > 0 ? (
          <div className="flex flex-col">
            {credentials.data.map((credential) => (
              <SubsonicCredentialRow key={credential.id} credential={credential} />
            ))}
          </div>
        ) : enabled ? (
          <span className={connectionMeta()}>{t("subsonic.credentials.empty")}</span>
        ) : null}

        {(status.data?.credentialsNeedingRotation ?? 0) > 0 ? (
          <Notice
            variant="warning"
            title={t("subsonic.rotation.title", { count: status.data?.credentialsNeedingRotation ?? 0 })}
          />
        ) : null}

        {enabled ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={connectionMeta()}>
              {t("subsonic.coverage.line", {
                streamable: status.data?.streamableTracks ?? 0,
                missing: status.data?.tracksWithoutPath ?? 0,
              })}
            </span>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              {t("subsonic.newCredential")}
            </Button>
          </div>
        ) : null}
      </div>

      <CreateSubsonicCredentialDialog open={createOpen} onOpenChange={setCreateOpen} />
    </section>
  );
}
