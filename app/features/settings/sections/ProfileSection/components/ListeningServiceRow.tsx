"use client";

import { AudioLines, Radio } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { Input } from "@components/ui/Input";
import { Switch } from "@components/ui/Switch";
import {
  useBeginLastfmAuthorization,
  useCompleteLastfmAuthorization,
  useConnectListenBrainz,
  useDisconnectListeningService,
  useSetRelayedClients,
  useSetScrobbleEnabled,
} from "@hooks/api";
import { cn } from "@utils/cn";

import {
  listeningChip,
  listeningClientList,
  listeningClientOption,
  listeningFailure,
  listeningPanel,
  listeningRow,
  listeningRowHeader,
  listeningToggleLabel,
  listeningToggleRow,
  listeningTokenRow,
} from "../styles";
import type { ListeningServiceRowProps } from "../types";

export function ListeningServiceRow({ connection, seenClients }: ListeningServiceRowProps) {
  const { t } = useTranslation("settings");
  const [token, setToken] = useState("");
  const [awaitingLastfm, setAwaitingLastfm] = useState(false);

  const beginLastfm = useBeginLastfmAuthorization();
  const completeLastfm = useCompleteLastfmAuthorization();
  const connectListenBrainz = useConnectListenBrainz();
  const disconnect = useDisconnectListeningService();
  const setEnabled = useSetScrobbleEnabled();
  const setRelayed = useSetRelayedClients();

  const service = connection.service;
  const isLastfm = service === "lastfm";
  const busy =
    beginLastfm.isPending || completeLastfm.isPending || connectListenBrainz.isPending || disconnect.isPending;

  const status = !connection.configured
    ? t("profile.listening.notConfigured")
    : connection.connected
      ? (connection.externalUsername ?? t("profile.listening.connected"))
      : t("profile.listening.notConnected");

  const startLastfm = () => {
    beginLastfm.mutate(undefined, {
      onSuccess: ({ authorizationUrl }) => {
        setAwaitingLastfm(true);
        window.open(authorizationUrl, "_blank", "noopener,noreferrer");
      },
    });
  };

  const toggleClient = (client: string, relayed: boolean) => {
    const next = relayed
      ? [...connection.relayedClients, client]
      : connection.relayedClients.filter((name) => name !== client);
    setRelayed.mutate({ service, clients: next });
  };

  return (
    <div className={listeningRow()}>
      <div className={listeningRowHeader()}>
        <span className={listeningChip({ service })}>{isLastfm ? <Radio size={18} /> : <AudioLines size={18} />}</span>
        <div className="min-w-0 flex-1">
          <p className="text-fg text-sm font-medium">{t(`profile.listening.${service}.name`)}</p>
          <p className="text-fg/50 truncate text-xs">{status}</p>
          {connection.lastFailure === null ? null : (
            <p className={listeningFailure()}>{t(`profile.listening.failure.${connection.lastFailure}`)}</p>
          )}
        </div>
        {connection.connected ? (
          <Button variant="outline" size="sm" onClick={() => disconnect.mutate({ service })} disabled={busy}>
            {t("profile.connected.disconnect")}
          </Button>
        ) : isLastfm ? (
          <Button size="sm" onClick={startLastfm} disabled={!connection.configured || busy}>
            {t("profile.connected.connect")}
          </Button>
        ) : null}
      </div>

      {!connection.connected && isLastfm && awaitingLastfm ? (
        <div className={listeningPanel()}>
          <p className={listeningToggleLabel()}>{t("profile.listening.lastfm.authorizeHint")}</p>
          <div>
            <Button size="sm" onClick={() => completeLastfm.mutate()} disabled={busy}>
              {t("profile.listening.lastfm.finish")}
            </Button>
          </div>
        </div>
      ) : null}

      {!connection.connected && !isLastfm ? (
        <div className={listeningPanel()}>
          <p className={listeningToggleLabel()}>{t("profile.listening.listenbrainz.tokenHint")}</p>
          <div className={listeningTokenRow()}>
            <Input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder={t("profile.listening.listenbrainz.tokenPlaceholder")}
              aria-label={t("profile.listening.listenbrainz.tokenLabel")}
            />
            <Button
              size="sm"
              onClick={() => connectListenBrainz.mutate({ token }, { onSuccess: () => setToken("") })}
              disabled={token.trim().length === 0 || busy}
            >
              {t("profile.connected.connect")}
            </Button>
          </div>
        </div>
      ) : null}

      {connection.connected ? (
        <div className={listeningPanel()}>
          <div className={listeningToggleRow()}>
            <span className={listeningToggleLabel()}>{t("profile.listening.sendPlays")}</span>
            <Switch
              checked={connection.scrobbleEnabled}
              onCheckedChange={(enabled) => setEnabled.mutate({ service, enabled })}
              aria-label={t("profile.listening.sendPlays")}
            />
          </div>
          {seenClients.length === 0 ? null : (
            <div>
              <p className={listeningToggleLabel()}>{t("profile.listening.otherApps")}</p>
              <div className={cn(listeningClientList(), "mt-2")}>
                {seenClients.map((client) => (
                  <label key={client} className={listeningClientOption()}>
                    <Checkbox
                      checked={connection.relayedClients.includes(client)}
                      onCheckedChange={(checked) => toggleClient(client, checked === true)}
                      aria-label={client}
                    />
                    {client}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
