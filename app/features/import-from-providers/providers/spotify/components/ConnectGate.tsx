"use client";

import { Clock, Music2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@components/ui/Button";
import { useSpotifyConnect, useSpotifyDisconnect } from "@hooks/api/mutations/spotify/useSpotifyConnect";
import { useSpotifyProbeProfile } from "@hooks/api/mutations/spotify/useSpotifyImport";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";

import { gateBody, gateLink, gateRoot, gateTitle } from "../../../styles";

import type { ConnectGateProps } from "./types";

export function ConnectGate({ configured, isAdmin, pending, onClose }: ConnectGateProps) {
  const connect = useSpotifyConnect();
  const disconnect = useSpotifyDisconnect();
  const probe = useSpotifyProbeProfile();
  const status = useSpotifyConnectionStatus();
  const [retrying, setRetrying] = useState(false);

  if (!configured) {
    return (
      <div className={gateRoot()}>
        <Music2 className="text-fg/40 size-10" />
        <h3 className={gateTitle()}>Spotify is not configured yet</h3>
        <p className={gateBody()}>
          {isAdmin ? (
            <>
              Configure it first at{" "}
              <Link href="/settings/integrations/spotify" onClick={onClose} className={gateLink()}>
                Settings → Integrations → Spotify
              </Link>
              .
            </>
          ) : (
            <>
              Ask your administrator to set the Spotify Client ID and Public Base URL at{" "}
              <span className="text-fg/80 font-medium">Settings → Integrations → Spotify</span>.
            </>
          )}
        </p>
      </div>
    );
  }

  if (pending) {
    const handleRetry = async () => {
      setRetrying(true);
      try {
        await probe.mutateAsync();
        await status.refetch();
      } finally {
        setRetrying(false);
      }
    };

    return (
      <div className={gateRoot()}>
        <Clock className="size-10 text-amber-300" />
        <h3 className={gateTitle()}>Waiting for Spotify to authorize your library access</h3>
        <p className={gateBody()}>
          Your tokens are stored, but Spotify is still rejecting API calls. Synthseek will keep retrying in the
          background; for most of the cases you don&apos;t need to reconnect.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} disabled={retrying || probe.isPending}>
            {retrying || probe.isPending ? "Checking…" : "Check now"}
          </Button>
          <Button variant="ghost" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={gateRoot()}>
      <Music2 className="size-10 text-emerald-400" />
      <h3 className={gateTitle()}>Connect your Spotify account</h3>
      <p className={gateBody()}>Authorize Synthseek to read your playlists, liked songs, saved albums and top items.</p>
      <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
        {connect.isPending ? "Redirecting…" : "Connect Spotify"}
      </Button>
    </div>
  );
}
