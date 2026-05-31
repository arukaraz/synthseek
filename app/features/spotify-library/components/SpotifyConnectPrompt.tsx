"use client";

import { Button } from "@components/ui/Button";
import { useSpotifyConnect } from "@hooks/api/mutations/spotify/useSpotifyConnect";

import { connectPrompt, connectPromptBody, connectPromptIcon, connectPromptTitle } from "../styles";
import { SpotifyMark } from "./SpotifyMark";
import type { SpotifyConnectPromptProps } from "./types";

export function SpotifyConnectPrompt({ pending, statusLoading }: SpotifyConnectPromptProps) {
  const connect = useSpotifyConnect();

  if (statusLoading) {
    return (
      <div className={connectPrompt()}>
        <span className="text-fg/60 text-sm">Checking your Spotify connection...</span>
      </div>
    );
  }

  return (
    <div className={connectPrompt()}>
      <span className={connectPromptIcon()}>
        <SpotifyMark size={28} />
      </span>
      <h2 className={connectPromptTitle()}>Connect your Spotify account</h2>
      <p className={connectPromptBody()}>
        {pending
          ? "Spotify is still authorizing your account. Try connecting again if it does not finish in a moment."
          : "Authorize Synthseek to browse and import your Spotify playlists and saved albums."}
      </p>
      <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
        <SpotifyMark size={14} />
        {pending ? "Reconnect Spotify" : "Connect Spotify"}
      </Button>
    </div>
  );
}
