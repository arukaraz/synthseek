"use client";

import { Plug } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";

import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { ListManager } from "../../components/ListManager";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface SlskdCardProps {
  initial: { apiUrl: string; apiKey: string; bannedUsers: string[] };
}

export function SlskdCard({ initial }: SlskdCardProps) {
  const update = useUpdateConnectionsSlskd();
  const testConnection = useTestSlskd();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);
  const [testing, setTesting] = useState(false);

  if (!draft) return null;

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testConnection.mutateAsync({ apiUrl: draft.apiUrl, apiKey: draft.apiKey });
      if (result.ok) toast.success(result.message ?? "Connected");
      else toast.error(result.message ?? "Connection failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <SettingsCard title="slskd" description="Required for downloads.">
      <SettingsField label="API URL" helper="Where Synthseek can reach your slskd daemon.">
        <SettingsTextInput
          value={draft.apiUrl}
          onChange={(v) => setField("apiUrl", v)}
          placeholder="http://localhost:5030"
          type="url"
        />
      </SettingsField>

      <SettingsField label="API Key">
        <SettingsSecretInput value={draft.apiKey} onChange={(v) => setField("apiKey", v)} />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleTest} disabled={testing || !draft.apiUrl || !draft.apiKey}>
          <Plug className="size-4" />
          {testing ? "Testing..." : "Test connection"}
        </Button>
      </div>

      <SettingsField label="Banned uploaders">
        <ListManager
          value={draft.bannedUsers}
          onChange={(v) => setField("bannedUsers", v)}
          addPlaceholder="e.g. spammer123"
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
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
