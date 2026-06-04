"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { SpotifyMark } from "@features/spotify-library";
import { usePlexUnlink } from "@hooks/api/mutations/auth/usePlexUnlink";
import { useSpotifyConnect, useSpotifyDisconnect } from "@hooks/api/mutations/spotify/useSpotifyConnect";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsCard } from "../../../components/SettingsCard";
import { usePlexLink } from "../hooks/usePlexLink";
import { connectedRow, plexChip, spotifyChip } from "../styles";
import { PlexMark } from "./PlexMark";

export function ConnectedAccountsCard() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();
  const config = usePublicConfig();
  const status = useSpotifyConnectionStatus();
  const connect = useSpotifyConnect();
  const disconnect = useSpotifyDisconnect();
  const plexLink = usePlexLink();
  const plexUnlink = usePlexUnlink();

  const spotifyEnabled = config.data?.spotify.enabled ?? false;
  const configured = config.data?.spotify.configured ?? false;
  const connected = status.data?.connected ?? false;
  const externalUsername = status.data?.externalUsername;

  const plexLinked = currentUser?.plexLinked ?? false;
  const canUnlinkPlex = plexLinked && (currentUser?.hasPassword ?? false);

  return (
    <SettingsCard title={t("profile.connected.title")}>
      {spotifyEnabled ? (
        <div className={connectedRow()}>
          <span className={spotifyChip()}>
            <SpotifyMark size={18} />
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
          </div>
          {connected ? (
            <Button variant="outline" size="sm" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
              {t("profile.connected.disconnect")}
            </Button>
          ) : (
            <Button size="sm" onClick={() => connect.mutate()} disabled={!configured || connect.isPending}>
              {t("profile.connected.connect")}
            </Button>
          )}
        </div>
      ) : null}

      {currentUser ? (
        <div className={connectedRow()}>
          <span className={plexChip()}>
            <PlexMark size={18} />
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
            {plexLinked && !canUnlinkPlex ? (
              <p className="text-fg/40 mt-1 text-xs">{t("profile.connected.plex.needsPassword")}</p>
            ) : null}
          </div>
          {plexLinked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => plexUnlink.mutate()}
              disabled={!canUnlinkPlex || plexUnlink.isPending}
            >
              {t("profile.connected.disconnect")}
            </Button>
          ) : (
            <Button size="sm" onClick={() => plexLink.start()} disabled={plexLink.isPending}>
              {t("profile.connected.connect")}
            </Button>
          )}
        </div>
      ) : null}

      {!spotifyEnabled && !currentUser ? <p className="text-fg/60 text-sm">{t("profile.connected.empty")}</p> : null}
    </SettingsCard>
  );
}
