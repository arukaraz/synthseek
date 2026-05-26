"use client";

import { useUpdateEngineTimeouts } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";

interface TimeoutsCardProps {
  initial: {
    searchPhase: number;
    downloadPhase: number;
    importPhase: number;
    peerUnresponsive: number;
    queueWaitActivePeer: number;
    queueWaitIdlePeer: number;
  };
}

const MS = 1000;

export function TimeoutsCard({ initial }: TimeoutsCardProps) {
  const update = useUpdateEngineTimeouts();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title="Timeouts"
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.timeouts })} disabled={isSaving} />}
    >
      <EngineRow
        label="Search phase"
        description="How long slskd keeps each search request open on the Soulseek network before stopping collection of new results."
        control={
          <SettingsNumberInput
            value={Math.round(draft.searchPhase / MS)}
            onChange={(v) => setField("searchPhase", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel="Search phase timeout"
          />
        }
      />
      <EngineRow
        label="Download phase"
        description="Total budget for the full download phase per track. The track is marked failed if this elapses."
        control={
          <SettingsNumberInput
            value={Math.round(draft.downloadPhase / MS)}
            onChange={(v) => setField("downloadPhase", v * MS)}
            min={60}
            max={3600}
            suffix="s"
            ariaLabel="Download phase timeout"
          />
        }
      />
      <EngineRow
        label="Import phase"
        description="Total budget for the import phase per track. Marked failed if exceeded."
        control={
          <SettingsNumberInput
            value={Math.round(draft.importPhase / MS)}
            onChange={(v) => setField("importPhase", v * MS)}
            min={30}
            max={3600}
            suffix="s"
            ariaLabel="Import phase timeout"
          />
        }
      />
      <EngineRow
        label="Peer unresponsive"
        description="Max time a download can sit in slskd's unresponsive states before we cancel and try the next peer."
        control={
          <SettingsNumberInput
            value={Math.round(draft.peerUnresponsive / MS)}
            onChange={(v) => setField("peerUnresponsive", v * MS)}
            min={15}
            max={900}
            suffix="s"
            ariaLabel="Peer unresponsive timeout"
          />
        }
      />
      <EngineRow
        label="Queue wait (active peer)"
        description="Max wait in slskd's Queued states when the peer is already actively serving another download to us (likely to give this one its turn)."
        control={
          <SettingsNumberInput
            value={Math.round(draft.queueWaitActivePeer / MS)}
            onChange={(v) => setField("queueWaitActivePeer", v * MS)}
            min={30}
            max={1800}
            suffix="s"
            ariaLabel="Queue wait active peer timeout"
          />
        }
      />
      <EngineRow
        label="Queue wait (idle peer)"
        description="Max wait in slskd's queued states when the peer is not currently serving us anything (may be offline or ignoring the request)."
        control={
          <SettingsNumberInput
            value={Math.round(draft.queueWaitIdlePeer / MS)}
            onChange={(v) => setField("queueWaitIdlePeer", v * MS)}
            min={30}
            max={3600}
            suffix="s"
            ariaLabel="Queue wait idle peer timeout"
          />
        }
      />
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
