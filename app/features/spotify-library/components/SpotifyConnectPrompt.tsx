"use client";

import { Button } from "@components/ui/Button";
import { useSpotifyConnect } from "@hooks/api/mutations/spotify/useSpotifyConnect";
import { useTranslation } from "react-i18next";

import { connectPrompt, connectPromptBody, connectPromptIcon, connectPromptTitle } from "../styles";
import { SpotifyMark } from "./SpotifyMark";
import type { SpotifyConnectPromptProps } from "./types";

export function SpotifyConnectPrompt({ pending, statusLoading }: SpotifyConnectPromptProps) {
  const { t } = useTranslation("library");
  const connect = useSpotifyConnect();

  if (statusLoading) {
    return (
      <div className={connectPrompt()}>
        <span className="text-fg/60 text-sm">{t("spotifyLibrary.connect.checking")}</span>
      </div>
    );
  }

  return (
    <div className={connectPrompt()}>
      <span className={connectPromptIcon()}>
        <SpotifyMark size={28} />
      </span>
      <h2 className={connectPromptTitle()}>{t("spotifyLibrary.connect.title")}</h2>
      <p className={connectPromptBody()}>
        {pending ? t("spotifyLibrary.connect.bodyPending") : t("spotifyLibrary.connect.bodyDefault")}
      </p>
      <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
        {pending ? t("spotifyLibrary.connect.reconnect") : t("spotifyLibrary.connect.connect")}
      </Button>
    </div>
  );
}
