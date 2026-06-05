"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { IconButton } from "@components/ui/IconButton";
import { useRevokeApiKey } from "@hooks/api/mutations/api-keys/useRevokeApiKey";

import { createdTime, lastUsedTime } from "./helpers";
import { apiKeyInfo, apiKeyMeta, apiKeyMetaSeparator, apiKeyName, apiKeyRow } from "./styles";
import type { ApiKeyRowProps } from "./types";

export function ApiKeyRow({ apiKey }: ApiKeyRowProps) {
  const { t } = useTranslation("settings");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const revoke = useRevokeApiKey();

  const handleRevoke = () => {
    revoke.mutate({ id: apiKey.id });
    setConfirmOpen(false);
  };

  const lastUsed = lastUsedTime(apiKey.last_used_at);
  const lastUsedLabel = lastUsed ? t("api.row.lastUsed", { time: lastUsed }) : t("api.row.neverUsed");

  return (
    <div className={apiKeyRow()}>
      <div className={apiKeyInfo()}>
        <span className={apiKeyName()}>{apiKey.name}</span>
        <div className={apiKeyMeta()}>
          <span>{t("api.row.created", { time: createdTime(apiKey.created_at) })}</span>
          <span className={apiKeyMetaSeparator()}>·</span>
          <span>{lastUsedLabel}</span>
        </div>
      </div>

      <IconButton
        icon={Trash2}
        variant="red"
        size="sm"
        aria-label={t("api.row.revokeLabel", { name: apiKey.name })}
        onClick={() => setConfirmOpen(true)}
        disabled={revoke.isPending}
      />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevoke}
        title={t("api.revoke.title")}
        message={t("api.revoke.message")}
        confirmText={t("api.revoke.confirm")}
        variant="danger"
      />
    </div>
  );
}
