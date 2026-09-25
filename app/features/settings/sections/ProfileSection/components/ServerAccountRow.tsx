"use client";

import { Server } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Switch } from "@components/ui/Switch";
import { useLinkSourceAccount, useSetSourceReporting, useUnlinkSourceAccount } from "@hooks/api";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { LINK_OUTCOME_KEYS, SERVER_REPORT_FAILURE_KEYS } from "../constants";
import {
  listeningFailure,
  listeningPanel,
  listeningRow,
  listeningRowHeader,
  listeningToggleLabel,
  listeningToggleRow,
  listeningTokenRow,
  serverChip,
} from "../styles";
import type { ServerAccountRowProps } from "../types";

export function ServerAccountRow({ account }: ServerAccountRowProps) {
  const { t } = useTranslation("settings");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const link = useLinkSourceAccount();
  const unlink = useUnlinkSourceAccount();
  const setReporting = useSetSourceReporting();

  const server = account.server;
  const name = PLAYBACK_SERVER_NAMES[server];
  const busy = link.isPending || unlink.isPending;
  const failureKey = account.lastFailure === null ? undefined : SERVER_REPORT_FAILURE_KEYS[account.lastFailure];

  const handleLink = async () => {
    const result = await link.mutateAsync({ server, username: username.trim(), password });
    const message = t(LINK_OUTCOME_KEYS[result.outcome], { server: name });
    if (result.outcome !== "linked") {
      toast.error(message);
      return;
    }
    setPassword("");
    toast.success(message);
  };

  return (
    <div className={listeningRow()}>
      <div className={listeningRowHeader()}>
        <span className={serverChip()}>
          <Server className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-fg text-sm font-medium">{name}</p>
          <p className="text-fg/50 truncate text-xs">
            {account.connected
              ? t("profile.connected.server.linkedAs", { username: account.externalUsername ?? "" })
              : t("profile.connected.server.notLinked")}
          </p>
          {failureKey !== undefined ? <p className={listeningFailure()}>{t(failureKey)}</p> : null}
        </div>
        {account.connected ? (
          <Button variant="outline" size="sm" onClick={() => unlink.mutate({ server })} disabled={busy}>
            {t("profile.connected.disconnect")}
          </Button>
        ) : null}
      </div>

      {account.connected ? (
        <div className={listeningPanel()}>
          <div className={listeningToggleRow()}>
            <p className={listeningToggleLabel()}>{t("profile.connected.server.reporting", { server: name })}</p>
            <Switch
              checked={account.reportEnabled}
              onCheckedChange={(enabled) => setReporting.mutate({ server, enabled })}
              disabled={setReporting.isPending}
              aria-label={t("profile.connected.server.reporting", { server: name })}
            />
          </div>
        </div>
      ) : (
        <div className={listeningPanel()}>
          <p className={listeningToggleLabel()}>{t("profile.connected.server.linkHint", { server: name })}</p>
          <div className={listeningTokenRow()}>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t("profile.connected.server.username")}
              aria-label={t("profile.connected.server.username")}
              autoComplete="off"
            />
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("profile.connected.server.password")}
              aria-label={t("profile.connected.server.password")}
              autoComplete="new-password"
            />
            <Button
              size="sm"
              onClick={() => void handleLink()}
              disabled={username.trim().length === 0 || password.length === 0 || busy}
            >
              {t("profile.connected.connect")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
