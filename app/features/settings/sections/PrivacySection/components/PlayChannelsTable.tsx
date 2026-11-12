"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { usePrivacyOverview, useSetPlayChannel } from "@hooks/api";

import { CHANNEL_SCOPE_KEYS, CHANNEL_SCOPES, PLAY_CHANNEL_ROWS } from "../constants";
import { channelCell, channelHead, channelLabel, channelName, channelRow, channelTable } from "../styles";
import type { PrivacyCardProps } from "../types";

export function PlayChannelsTable({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const update = useSetPlayChannel();
  const overview = usePrivacyOverview();
  const nowPlayingOff = overview.data?.server.nowPlayingEnabled === false;

  return (
    <div className={channelTable()} role="table">
      <div role="row" className="contents">
        <span role="columnheader" aria-hidden />
        <span role="columnheader" className={channelHead()}>
          {t(CHANNEL_SCOPE_KEYS.default)}
        </span>
        <span role="columnheader" className={channelHead()}>
          {t(CHANNEL_SCOPE_KEYS.private)}
          <InfoTooltip description={t("privacy.channels.privateHint")} />
        </span>
      </div>
      {PLAY_CHANNEL_ROWS.map((row) => {
        const switches = user.playChannels[row.channel];
        const label = t(row.labelKey);
        return (
          <div key={row.channel} role="row" className={channelRow()} data-anchor-target={row.anchor}>
            <div role="cell" className={channelLabel()}>
              <span className={channelName()}>{label}</span>
              <InfoTooltip
                description={t(row.descriptionKey)}
                secondary={
                  row.channel === "nowPlaying" && nowPlayingOff ? t("privacy.channels.nowPlayingOff") : undefined
                }
              />
            </div>
            {CHANNEL_SCOPES.map((scope) => (
              <div key={scope} role="cell" className={channelCell()}>
                <Switch
                  checked={scope === "default" ? switches.default : switches.default && switches.private}
                  disabled={update.isPending || (scope === "private" && !switches.default)}
                  onCheckedChange={(enabled) => update.mutate({ channel: row.channel, scope, enabled })}
                  aria-label={t("privacy.channels.switch", { channel: label, scope: t(CHANNEL_SCOPE_KEYS[scope]) })}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
