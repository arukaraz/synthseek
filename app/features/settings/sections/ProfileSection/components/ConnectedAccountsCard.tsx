"use client";

import { Button } from "@components/ui/Button";
import { SpotifyMark } from "@features/spotify-library";
import { usePlexUnlink } from "@hooks/api/mutations/auth/usePlexUnlink";
import { useSpotifyConnect, useSpotifyDisconnect } from "@hooks/api/mutations/spotify/useSpotifyConnect";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsCard } from "../../../components/SettingsCard";
import { PROFILE_COPY } from "../constants";
import { usePlexLink } from "../hooks/usePlexLink";
import { connectedRow, plexChip, spotifyChip } from "../styles";
import { PlexMark } from "./PlexMark";

export function ConnectedAccountsCard() {
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
    <SettingsCard title={PROFILE_COPY.connectedTitle} description={PROFILE_COPY.connectedDescription}>
      {spotifyEnabled ? (
        <div className={connectedRow()}>
          <span className={spotifyChip()}>
            <SpotifyMark size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-fg text-sm font-medium">Spotify</p>
            <p className="text-fg/50 truncate text-xs">
              {connected
                ? (externalUsername ?? "Connected")
                : configured
                  ? "Not connected"
                  : PROFILE_COPY.spotifyNotConfigured}
            </p>
          </div>
          {connected ? (
            <Button variant="outline" size="sm" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
              {PROFILE_COPY.disconnect}
            </Button>
          ) : (
            <Button size="sm" onClick={() => connect.mutate()} disabled={!configured || connect.isPending}>
              {PROFILE_COPY.connect}
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
            <p className="text-fg text-sm font-medium">{PROFILE_COPY.plexName}</p>
            <p className="text-fg/50 truncate text-xs">
              {plexLinked
                ? (currentUser.plex_username ?? PROFILE_COPY.plexLinked)
                : plexLink.isPending
                  ? PROFILE_COPY.plexConnecting
                  : PROFILE_COPY.plexNotLinked}
            </p>
            {plexLinked && !canUnlinkPlex ? (
              <p className="text-fg/40 mt-1 text-xs">{PROFILE_COPY.plexNeedsPassword}</p>
            ) : null}
          </div>
          {plexLinked ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => plexUnlink.mutate()}
              disabled={!canUnlinkPlex || plexUnlink.isPending}
            >
              {PROFILE_COPY.disconnect}
            </Button>
          ) : (
            <Button size="sm" onClick={() => plexLink.start()} disabled={plexLink.isPending}>
              {PROFILE_COPY.connect}
            </Button>
          )}
        </div>
      ) : null}

      {!spotifyEnabled && !currentUser ? <p className="text-fg/60 text-sm">{PROFILE_COPY.noConnected}</p> : null}
    </SettingsCard>
  );
}
