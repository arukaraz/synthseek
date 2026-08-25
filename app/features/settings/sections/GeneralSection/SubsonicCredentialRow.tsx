"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { IconButton } from "@components/ui/IconButton";
import { useRevokeSubsonicCredential } from "@hooks/api/mutations/subsonic/useRevokeSubsonicCredential";

import { createdTime, lastUsedTime } from "./helpers";
import { apiKeyInfo, apiKeyMeta, apiKeyMetaSeparator, apiKeyName, apiKeyRow } from "./styles";
import type { SubsonicCredentialRowProps } from "./types";

export function SubsonicCredentialRow({ credential }: SubsonicCredentialRowProps) {
  const { t } = useTranslation("settings");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const revoke = useRevokeSubsonicCredential();

  const handleRevoke = () => {
    revoke.mutate({ id: credential.id });
    setConfirmOpen(false);
  };

  const lastUsed = lastUsedTime(credential.last_used_at);
  const lastUsedLabel = lastUsed ? t("subsonic.row.lastUsed", { time: lastUsed }) : t("subsonic.row.neverUsed");

  return (
    <div className={apiKeyRow()}>
      <div className={apiKeyInfo()}>
        <span className={apiKeyName()}>{credential.name}</span>
        <div className={apiKeyMeta()}>
          <span>{t("subsonic.row.created", { time: createdTime(credential.created_at) })}</span>
          <span className={apiKeyMetaSeparator()}>·</span>
          <span>{lastUsedLabel}</span>
          {credential.last_client ? (
            <>
              <span className={apiKeyMetaSeparator()}>·</span>
              <span>{t("subsonic.row.client", { client: credential.last_client })}</span>
            </>
          ) : null}
        </div>
      </div>

      <IconButton
        icon={Trash2}
        variant="red"
        size="sm"
        aria-label={t("subsonic.row.revokeLabel", { name: credential.name })}
        onClick={() => setConfirmOpen(true)}
        disabled={revoke.isPending}
      />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevoke}
        title={t("subsonic.revoke.title")}
        message={t("subsonic.revoke.message")}
        confirmText={t("subsonic.revoke.confirm")}
        variant="danger"
      />
    </div>
  );
}
