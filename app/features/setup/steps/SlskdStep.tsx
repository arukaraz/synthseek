"use client";

import { Plug } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { SettingsField } from "@features/settings/components/SettingsField";
import { SettingsSecretInput } from "@features/settings/components/SettingsSecretInput";
import { SettingsTextInput } from "@features/settings/components/SettingsTextInput";
import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";

import { StepShell } from "./StepShell";

interface SlskdStepProps {
  stepIndex: number;
  totalSteps: number;
  onComplete: () => void;
  onBack: () => void;
}

export function SlskdStep({ stepIndex, totalSteps, onComplete, onBack }: SlskdStepProps) {
  const update = useUpdateConnectionsSlskd();
  const testConn = useTestSlskd();
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [tested, setTested] = useState(false);

  const handleTest = async () => {
    const result = await testConn.mutateAsync({ apiUrl, apiKey });
    if (result.ok) {
      toast.success(result.message ?? "Connected");
      setTested(true);
    } else {
      toast.error(result.message ?? "Connection failed");
      setTested(false);
    }
  };

  const handleContinue = async () => {
    try {
      await update.mutateAsync({ apiUrl, apiKey });
      onComplete();
    } catch {
      /* toast handled by hook */
    }
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Connect to slskd"
      description="Synthseek talks to the Soulseek network through your slskd daemon. This step is required."
      primaryLabel="Continue"
      primaryDisabled={!apiUrl || !apiKey}
      primaryLoading={update.isPending}
      onPrimary={handleContinue}
      showBack
      onBack={onBack}
    >
      <SettingsField label="API URL">
        <SettingsTextInput value={apiUrl} onChange={setApiUrl} placeholder="http://localhost:5030" type="url" />
      </SettingsField>
      <SettingsField label="API Key">
        <SettingsSecretInput value={apiKey} onChange={setApiKey} />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleTest} disabled={!apiUrl || !apiKey || testConn.isPending}>
          <Plug className="size-4" />
          {testConn.isPending ? "Testing..." : "Test connection"}
        </Button>
        {tested ? <span className="text-xs text-emerald-300">● Connection verified</span> : null}
      </div>
    </StepShell>
  );
}
