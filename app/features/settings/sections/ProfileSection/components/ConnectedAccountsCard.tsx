"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import { usePlaybackSourceAccounts } from "@hooks/api";
import { usePlexUnlink } from "@hooks/api/mutations/auth/usePlexUnlink";
import { useConnectLibrarySource } from "@hooks/api/mutations/library-source/useConnectLibrarySource";
import { useSpotifyDisconnect } from "@hooks/api/mutations/spotify/useSpotifyDisconnect";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";

import { SettingsCard } from "../../../components/SettingsCard";
import { usePlexLink } from "../hooks/usePlexLink";
import { accountChip, listeningFailure, listeningRow, listeningRowHeader } from "../styles";
import { PlexReportingRow } from "./PlexReportingRow";
import { ServerAccountRow } from "./ServerAccountRow";
import { UnlinkPlexDialog } from "./UnlinkPlexDialog";

export function ConnectedAccountsCard() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();
  const config = usePublicConfig();
  const status = useSpotifyConnectionStatus();
  const connect = useConnectLibrarySource();
  const disconnect = useSpotifyDisconnect();
  const plexLink = usePlexLink();
  const plexUnlink = usePlexUnlink();
  const sourceAccounts = usePlaybackSourceAccounts();

  const spotifyEnabled = config.data?.spotify.enabled ?? false;
  const configured = config.data?.spotify.configured ?? false;
  const connected = status.data?.connected ?? false;
  const needsReconnect = connected && (status.data?.needsReconnect ?? false);
  const externalUsername = status.data?.externalUsername;

  const passwordAccounts = (sourceAccounts.data ?? []).filter((account) => account.linkMethod === "password");

  const plexLinked = currentUser?.plexLinked ?? false;
  const plexIsOnlySignIn = plexLinked && !(currentUser?.hasPassword ?? false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);

  return (
    <SettingsCard title={t("profile.connected.title")}>
      {spotifyEnabled ? (
        <div className={listeningRow()} data-anchor-target="spotify">
          <div className={listeningRowHeader()}>
            <span className={cn(accountChip(), providerTone({ provider: "spotify" }))}>
              <ProviderMark provider="spotify" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm font-medium">{t("profile.connected.spotify.name")}</p>
              <p className="text-fg/50 truncate text-xs">
                {connected
                  ? (externalUsername ?? t("profile.connected.spotify.connected"))
                  : configured
                    ? t("profile.connected.spotify.notConnected")
                    : t("profile.connected.spotify.notConfigured")}
              </p>
              {needsReconnect ? (
                <p className={listeningFailure()} role="status">
                  {t("profile.connected.spotify.needsReconnect")}
                </p>
              ) : null}
            </div>
            {needsReconnect ? (
              <Button
                size="sm"
                onClick={() => connect.mutate({ provider: "spotify" })}
                disabled={!configured || connect.isPending}
              >
                {t("profile.connected.reconnect")}
              </Button>
            ) : null}
            {connected ? (
              <Button variant="outline" size="sm" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
                {t("profile.connected.disconnect")}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => connect.mutate({ provider: "spotify" })}
                disabled={!configured || connect.isPending}
              >
                {t("profile.connected.connect")}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {currentUser ? (
        <div className={listeningRow()} data-anchor-target="plex">
          <div className={listeningRowHeader()}>
            <span className={cn(accountChip(), providerTone({ provider: "plex" }))}>
              <ProviderMark provider="plex" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm font-medium">{t("profile.connected.plex.name")}</p>
              <p className="text-fg/50 truncate text-xs">
                {plexLinked
                  ? (currentUser.plex_username ?? t("profile.connected.plex.linked"))
                  : plexLink.isPending
                    ? t("profile.connected.plex.connecting")
                    : t("profile.connected.plex.notLinked")}
              </p>
              {plexIsOnlySignIn ? (
                <p className="text-fg/40 mt-1 text-xs">{t("profile.connected.plex.needsPassword")}</p>
              ) : null}
            </div>
            {plexLinked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (plexIsOnlySignIn ? setUnlinkDialogOpen(true) : plexUnlink.mutate())}
                disabled={plexUnlink.isPending}
              >
                {t("profile.connected.disconnect")}
              </Button>
            ) : (
              <Button size="sm" onClick={() => plexLink.start()} disabled={plexLink.isPending}>
                {t("profile.connected.connect")}
              </Button>
            )}
          </div>
          {plexLinked ? <PlexReportingRow onRelink={() => plexLink.start()} relinking={plexLink.isPending} /> : null}
          {plexIsOnlySignIn ? (
            <UnlinkPlexDialog email={currentUser.email} open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen} />
          ) : null}
        </div>
      ) : null}

      {passwordAccounts.map((account) => (
        <ServerAccountRow key={account.server} account={account} />
      ))}

      {!spotifyEnabled && !currentUser ? <p className="text-fg/60 text-sm">{t("profile.connected.empty")}</p> : null}
    </SettingsCard>
  );
}
