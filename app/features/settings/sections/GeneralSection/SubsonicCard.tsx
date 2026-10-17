"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { Switch } from "@components/ui/Switch";
import { DataTable } from "@components/ui/Table";
import { useUpdateConnectApps } from "@hooks/api/mutations/settings/useUpdateConnectApps";
import { useRevokeSubsonicCredential } from "@hooks/api/mutations/subsonic/useRevokeSubsonicCredential";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useSubsonicCredentials } from "@hooks/api/queries/useSubsonicCredentials";
import { useSubsonicStatus } from "@hooks/api/queries/useSubsonicStatus";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { confirm } from "@utils/confirm";

import { SettingsCard } from "../../components/SettingsCard";
import { ConnectionValueField } from "./ConnectionValueField";
import { CreateSubsonicCredentialDialog } from "./CreateSubsonicCredentialDialog";
import { buildCredentialColumns } from "./credentialColumns";
import { publicEndpoint } from "./helpers";
import { connectionBody, connectionError, connectionFooterRow, connectionMeta } from "./styles";
import type { SubsonicCredentialSummary } from "./types";

export function SubsonicCard() {
  const { t } = useTranslation("settings");
  const { currentUser, isAdmin } = useAuthContext();
  const status = useSubsonicStatus();
  const credentials = useSubsonicCredentials();
  const publicConfig = usePublicConfig();
  const updateConnectApps = useUpdateConnectApps();
  const revoke = useRevokeSubsonicCredential();
  const [createOpen, setCreateOpen] = useState(false);

  const handleRevoke = async (credential: SubsonicCredentialSummary) => {
    const confirmed = await confirm({
      title: t("subsonic.revoke.title"),
      message: t("subsonic.revoke.message"),
      confirmText: t("subsonic.revoke.confirm"),
      variant: "danger",
    });
    if (confirmed) revoke.mutate({ id: credential.id });
  };

  const columns = buildCredentialColumns({
    t,
    revoking: revoke.isPending,
    onRevoke: handleRevoke,
    revokeLabelKey: "subsonic.row.revokeLabel",
    appOf: (credential) => credential.last_client,
  });

  const enabled = status.data?.enabled ?? false;
  const address = publicEndpoint(
    status.data?.basePath ?? "/api/v1/subsonic",
    publicConfig.data?.publicBaseUrl || undefined
  );

  return (
    <SettingsCard
      title={t("subsonic.title")}
      description={t("subsonic.description")}
      anchor="music-players"
      trailing={
        isAdmin ? (
          <Switch
            checked={enabled}
            onCheckedChange={(next) =>
              updateConnectApps.mutate({
                subsonicEnabled: next,
                subsonicTranscodingEnabled: status.data?.transcodingEnabled ?? true,
              })
            }
            disabled={status.isLoading || updateConnectApps.isPending}
            aria-label={t("subsonic.enable.ariaLabel")}
          />
        ) : null
      }
    >
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
          <span className={connectionError()}>
            {t("subsonic.credentials.loadError", { message: credentials.error.message })}
          </span>
        ) : credentials.data && credentials.data.length > 0 ? (
          <DataTable
            data={credentials.data}
            columns={columns}
            getRowId={(credential) => credential.id}
            staggerDelay={0}
          />
        ) : enabled ? (
          <span className={connectionMeta()}>{t("subsonic.credentials.empty")}</span>
        ) : null}

        {(status.data?.credentialsNeedingRotation ?? 0) > 0 ? (
          <Notice
            variant="warning"
            title={t("subsonic.rotation.title", { count: status.data?.credentialsNeedingRotation ?? 0 })}
          />
        ) : null}

        {enabled && isAdmin ? (
          <div className={connectionFooterRow()} data-anchor-target="connectApps.subsonicTranscodingEnabled">
            <div className={connectionBody()}>
              <span className="text-fg text-sm font-medium">{t("subsonic.transcoding.label")}</span>
              <span className={connectionMeta()}>{t("subsonic.transcoding.description")}</span>
            </div>
            <Switch
              checked={status.data?.transcodingEnabled ?? true}
              onCheckedChange={(next) =>
                updateConnectApps.mutate({ subsonicEnabled: enabled, subsonicTranscodingEnabled: next })
              }
              disabled={status.isLoading || updateConnectApps.isPending}
              aria-label={t("subsonic.transcoding.ariaLabel")}
            />
          </div>
        ) : null}

        {enabled ? (
          <div className={connectionFooterRow()}>
            <span className={connectionMeta()}>
              {t("subsonic.coverage.line", {
                streamable: status.data?.streamableTracks ?? 0,
                missing: status.data?.unplayableTracks ?? 0,
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
    </SettingsCard>
  );
}
