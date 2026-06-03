"use client";

import { Plug } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";

import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useSlskdStatus } from "@hooks/api/queries/useSlskdStatus";
import { validateSlskdApiUrl } from "@utils/slskd-url";
import { ListManager } from "../../components/ListManager";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, fieldError, fieldWarning } from "../../styles";
import {
  BANNED_UPLOADERS_TOOLTIP_AUTO,
  BANNED_UPLOADERS_TOOLTIP_TRIGGER_LABEL,
  BANNED_UPLOADERS_TOOLTIP_WHAT,
} from "./constants";
import { SlskdStatusBadge } from "./SlskdStatusBadge";
import type { SlskdCardProps } from "./types";

export function SlskdCard({ initial }: SlskdCardProps) {
  const update = useUpdateConnectionsSlskd();
  const testConnection = useTestSlskd();
  const status = useSlskdStatus();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);
  const [testing, setTesting] = useState(false);

  if (!draft) return null;

  const urlCheck = validateSlskdApiUrl(draft.apiUrl);
  const urlError = draft.apiUrl.length > 0 && !urlCheck.ok ? urlCheck.error : undefined;
  const urlWarning = urlCheck.ok ? urlCheck.warning : undefined;

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testConnection.mutateAsync({ apiUrl: urlCheck.normalized, apiKey: draft.apiKey });
      if (result.ok) toast.success(result.message ?? "Connected");
      else toast.error(result.message ?? "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setField("apiUrl", urlCheck.normalized);
    return save((payload) => update.mutateAsync({ ...payload, apiUrl: urlCheck.normalized }));
  };

  return (
    <SettingsCard
      title="Slskd"
      description="Required for downloads."
      trailing={
        status.data ? (
          <SlskdStatusBadge
            status={status.data.status}
            message={status.data.message !== "Connected" ? status.data.message : undefined}
          />
        ) : null
      }
    >
      <SettingsField label="API URL" helper="">
        <SettingsTextInput
          value={draft.apiUrl}
          onChange={(v) => setField("apiUrl", v)}
          placeholder="http://localhost:5030"
          type="url"
        />
        {urlError ? (
          <p role="alert" className={fieldError()}>
            {urlError}
          </p>
        ) : urlWarning ? (
          <p className={fieldWarning()}>{urlWarning}</p>
        ) : null}
      </SettingsField>

      <SettingsField label="API Key">
        <SettingsSecretInput value={draft.apiKey} onChange={(v) => setField("apiKey", v)} />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testing || !draft.apiUrl || !draft.apiKey || Boolean(urlError)}
        >
          <Plug className="size-4" />
          {testing ? "Testing..." : "Test connection"}
        </Button>
      </div>

      <div role="separator" className={cardDivider()} />

      <SettingsField
        label="Banned uploaders"
        contentSpacing="loose"
        labelTrailing={
          <InfoTooltip
            description={BANNED_UPLOADERS_TOOLTIP_WHAT}
            secondary={BANNED_UPLOADERS_TOOLTIP_AUTO}
            triggerLabel={BANNED_UPLOADERS_TOOLTIP_TRIGGER_LABEL}
          />
        }
      >
        <ListManager
          value={draft.bannedUsers}
          onChange={(v) => setField("bannedUsers", v)}
          addPlaceholder="e.g. user123"
          filterPlaceholder="Filter banlist..."
          emptyLabel="No banned uploaders yet."
          countLabel={(n) => `${n} banned`}
          helper={
            <>
              Skip these slskd users/peers when picking download candidates.{" "}
              <Link
                href="/settings/engine#ban-threshold"
                className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
              >
                Configure threshold
              </Link>
            </>
          }
        />
      </SettingsField>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        saveDisabled={Boolean(urlError)}
        onSave={handleSave}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
