"use client";

import { Button } from "@components/ui/Button";
import { SpotifyMark } from "@features/spotify-library";
import { useSpotifyConnect, useSpotifyDisconnect } from "@hooks/api/mutations/spotify/useSpotifyConnect";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";

import { SettingsCard } from "../../../components/SettingsCard";
import { PROFILE_COPY } from "../constants";
import { connectedRow, spotifyChip } from "../styles";

export function ConnectedAccountsCard() {
  const config = usePublicConfig();
  const status = useSpotifyConnectionStatus();
  const connect = useSpotifyConnect();
  const disconnect = useSpotifyDisconnect();

  const spotifyEnabled = config.data?.spotify.enabled ?? false;
  const configured = config.data?.spotify.configured ?? false;
  const connected = status.data?.connected ?? false;
  const externalUsername = status.data?.externalUsername;

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
      ) : (
        <p className="text-fg/60 text-sm">{PROFILE_COPY.noConnected}</p>
      )}
    </SettingsCard>
  );
}
