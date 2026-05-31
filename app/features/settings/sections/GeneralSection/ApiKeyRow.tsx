"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { IconButton } from "@components/ui/IconButton";
import { useRevokeApiKey } from "@hooks/api/mutations/api-keys/useRevokeApiKey";

import { REVOKE_KEY_DIALOG } from "./constants";
import { formatCreated, formatLastUsed } from "./helpers";
import { apiKeyRow } from "./styles";
import type { ApiKeyRowProps } from "./types";

export function ApiKeyRow({ apiKey }: ApiKeyRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const revoke = useRevokeApiKey();

  const handleRevoke = () => {
    revoke.mutate({ id: apiKey.id });
    setConfirmOpen(false);
  };

  return (
    <div className={apiKeyRow()}>
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-fg truncate text-sm font-medium">{apiKey.name}</span>
        <span className="text-fg/30 shrink-0 text-xs">·</span>
        <span className="text-fg/50 shrink-0 text-xs">{formatCreated(apiKey.created_at)}</span>
        <span className="text-fg/30 shrink-0 text-xs">·</span>
        <span className="text-fg/50 shrink-0 text-xs">{formatLastUsed(apiKey.last_used_at)}</span>
      </div>

      <IconButton
        icon={Trash2}
        variant="red"
        size="sm"
        aria-label={`Revoke ${apiKey.name}`}
        onClick={() => setConfirmOpen(true)}
        disabled={revoke.isPending}
      />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevoke}
        title={REVOKE_KEY_DIALOG.title}
        message={REVOKE_KEY_DIALOG.message}
        confirmText={REVOKE_KEY_DIALOG.confirm}
        variant="danger"
      />
    </div>
  );
}
