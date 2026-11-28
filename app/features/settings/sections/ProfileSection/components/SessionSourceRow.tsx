"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import { SessionConnectForm } from "@components/SessionConnectForm";
import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useDisconnectLibrarySession } from "@hooks/api/mutations/library-source/useDisconnectLibrarySession";
import { cn } from "@utils/cn";

import { accountChip, listeningFailure, listeningPanel, listeningRow, listeningRowHeader } from "../styles";
import type { SessionSourceRowProps } from "../types";

export function SessionSourceRow({ source }: SessionSourceRowProps) {
  const { t } = useTranslation("settings");
  const disconnect = useDisconnectLibrarySession();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const provider = source.name;
  const connected = source.connected;
  const needsReconnect = connected && source.needsReconnect;
  const offersForm = source.configured && (!connected || needsReconnect);

  return (
    <div className={listeningRow()} data-anchor-target={source.provider}>
      <div className={listeningRowHeader()}>
        <span className={cn(accountChip(), providerTone({ provider: source.provider }))}>
          <ProviderMark provider={source.provider} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-fg text-sm font-medium">{provider}</p>
          <p className="text-fg/50 truncate text-xs">
            {connected
              ? source.externalUsername
                ? t("profile.connected.session.connectedAs", { username: source.externalUsername })
                : t("profile.connected.session.connected")
              : t("profile.connected.session.notConnected")}
          </p>
          {needsReconnect ? (
            <p className={listeningFailure()} role="status">
              {t("profile.connected.session.needsReconnect", { provider })}
            </p>
          ) : null}
        </div>
        {connected ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={disconnect.isPending}>
            {t("profile.connected.disconnect")}
          </Button>
        ) : null}
      </div>

      {offersForm ? (
        <div className={listeningPanel()}>
          <SessionConnectForm source={source} reconnect={needsReconnect} />
        </div>
      ) : null}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          disconnect.mutate({ provider: source.provider });
        }}
        title={t("profile.connected.session.disconnectTitle", { provider })}
        message={t("profile.connected.session.disconnectMessage", { provider })}
        confirmText={t("profile.connected.disconnect")}
        variant="danger"
      />
    </div>
  );
}
