"use client";

import { useTranslation } from "react-i18next";

import { useUpdateEngineTimeouts } from "@hooks/api/mutations/settings/useUpdateEngine";

import { EngineRow } from "../../components/EngineRow";
import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { ENGINE_DEFAULTS } from "./defaults";
import { MS } from "./constants";
import type { TimeoutsCardProps } from "./types";

export function TimeoutsCard({ initial }: TimeoutsCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineTimeouts();
  const { draft, setField, setAll, save, reset, isDirty, isSaving } = useSettingsForm(initial);

  if (!draft) return null;

  return (
    <SettingsCard
      title={t("timeouts.title")}
      trailing={<ResetDefaultsButton onReset={() => setAll({ ...ENGINE_DEFAULTS.timeouts })} disabled={isSaving} />}
    >
      <EngineRow
        label={t("timeouts.searchPhase.label")}
        description={t("timeouts.searchPhase.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.searchPhase / MS)}
            onChange={(v) => setField("searchPhase", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t("timeouts.searchPhase.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.downloadPhase.label")}
        description={t("timeouts.downloadPhase.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.downloadPhase / MS)}
            onChange={(v) => setField("downloadPhase", v * MS)}
            min={60}
            max={3600}
            suffix="s"
            ariaLabel={t("timeouts.downloadPhase.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.importPhase.label")}
        description={t("timeouts.importPhase.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.importPhase / MS)}
            onChange={(v) => setField("importPhase", v * MS)}
            min={30}
            max={3600}
            suffix="s"
            ariaLabel={t("timeouts.importPhase.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.peerUnresponsive.label")}
        description={t("timeouts.peerUnresponsive.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.peerUnresponsive / MS)}
            onChange={(v) => setField("peerUnresponsive", v * MS)}
            min={15}
            max={900}
            suffix="s"
            ariaLabel={t("timeouts.peerUnresponsive.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.queueWaitActivePeer.label")}
        description={t("timeouts.queueWaitActivePeer.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.queueWaitActivePeer / MS)}
            onChange={(v) => setField("queueWaitActivePeer", v * MS)}
            min={30}
            max={1800}
            suffix="s"
            ariaLabel={t("timeouts.queueWaitActivePeer.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.queueWaitIdlePeer.label")}
        description={t("timeouts.queueWaitIdlePeer.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.queueWaitIdlePeer / MS)}
            onChange={(v) => setField("queueWaitIdlePeer", v * MS)}
            min={30}
            max={3600}
            suffix="s"
            ariaLabel={t("timeouts.queueWaitIdlePeer.ariaLabel")}
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
