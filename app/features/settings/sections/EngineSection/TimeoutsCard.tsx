"use client";

import { useUpdateEngineTimeouts } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";

interface TimeoutsCardProps {
  initial: {
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
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard title="Timeouts">
      <EngineRow
        label="Download phase"
        description="Total budget for the full download phase per track (every search variation, every peer attempt, plus the actual transfer). The track is marked failed if this elapses."
        control={
          <SettingsNumberInput
            value={Math.round(draft.downloadPhase / MS)}
            onChange={(v) => setField("downloadPhase", v * MS)}
            min={60}
            max={1800}
            suffix="s"
            ariaLabel="Download phase timeout"
          />
        }
      />
      <EngineRow
        label="Import phase"
        description="Total budget for the import phase per track (Beets matching, metadata enrichment, library move). Marked failed if exceeded."
        control={
          <SettingsNumberInput
            value={Math.round(draft.importPhase / MS)}
            onChange={(v) => setField("importPhase", v * MS)}
            min={60}
            max={900}
            suffix="s"
            ariaLabel="Import phase timeout"
          />
        }
      />
      <EngineRow
        label="Peer unresponsive"
        description="Max time a download can sit in slskd's Queued / Queued Locally / Initializing / Requested state before we cancel and try the next peer."
        control={
          <SettingsNumberInput
            value={Math.round(draft.peerUnresponsive / MS)}
            onChange={(v) => setField("peerUnresponsive", v * MS)}
            min={30}
            max={600}
            suffix="s"
            ariaLabel="Peer unresponsive timeout"
          />
        }
      />
      <EngineRow
        label="Queue wait (active peer)"
        description="Max wait in slskd's 'Queued, Remotely' state when the peer is already actively serving another download to us (likely to give this one its turn)."
        control={
          <SettingsNumberInput
            value={Math.round(draft.queueWaitActivePeer / MS)}
            onChange={(v) => setField("queueWaitActivePeer", v * MS)}
            min={60}
            max={900}
            suffix="s"
            ariaLabel="Queue wait active peer timeout"
          />
        }
      />
      <EngineRow
        label="Queue wait (idle peer)"
        description="Max wait in slskd's 'Queued, Remotely' state when the peer is not currently serving us anything (may be offline or ignoring the request)."
        control={
          <SettingsNumberInput
            value={Math.round(draft.queueWaitIdlePeer / MS)}
            onChange={(v) => setField("queueWaitIdlePeer", v * MS)}
            min={60}
            max={1800}
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
