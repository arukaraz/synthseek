"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";

import { useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
import { useRevealSettingsSecret } from "@hooks/api/mutations/settings/useRevealSecret";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { MS } from "./constants";
import { DownloadedAlbumsPointer } from "./DownloadedAlbumsPointer";
import { withoutPriority } from "./helpers";
import type { UsenetCardProps } from "./types";

export function UsenetCard({ initial }: UsenetCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const reveal = useRevealSettingsSecret();
  const stored = useMemo(() => withoutPriority(initial.usenet), [initial.usenet]);
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(stored);

  if (!draft) return null;

  return (
    <SettingsCard title={t("usenet.title")} optional description={t("usenet.description")} anchor="usenet">
      <EngineRow
        label={t("usenet.enable.label")}
        description={t("usenet.enable.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("usenet.enable.ariaLabel")}
          />
        }
      />

      <SettingsField label={t("usenet.indexerUrl.label")} anchor="downloadSources.usenet.indexerUrl">
        <SettingsTextInput
          value={draft.indexerUrl}
          onChange={(v) => setField("indexerUrl", v)}
          placeholder={t("usenet.indexerUrl.placeholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField label={t("usenet.indexerApiKey.label")}>
        <SettingsSecretInput
          value={draft.indexerApiKey}
          onChange={(v) => setField("indexerApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "downloadSources.usenet", field: "indexerApiKey" }),
          }}
          ariaLabel={t("usenet.indexerApiKey.label")}
        />
      </SettingsField>

      <SettingsField label={t("usenet.sabnzbdUrl.label")} anchor="downloadSources.usenet.sabnzbdUrl">
        <SettingsTextInput
          value={draft.sabnzbdUrl}
          onChange={(v) => setField("sabnzbdUrl", v)}
          placeholder={t("usenet.sabnzbdUrl.placeholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField label={t("usenet.sabnzbdApiKey.label")}>
        <SettingsSecretInput
          value={draft.sabnzbdApiKey}
          onChange={(v) => setField("sabnzbdApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "downloadSources.usenet", field: "sabnzbdApiKey" }),
          }}
          ariaLabel={t("usenet.sabnzbdApiKey.label")}
        />
      </SettingsField>

      <EngineRow
        anchor="downloadSources.usenet.maxSizeMb"
        label={t("usenet.maxSize.label")}
        description={t("usenet.maxSize.description")}
        control={
          <SettingsNumberInput
            value={draft.maxSizeMb}
            onChange={(v) => setField("maxSizeMb", v)}
            min={0}
            max={100000}
            suffix={t("usenet.maxSize.suffix")}
            ariaLabel={t("usenet.maxSize.ariaLabel")}
          />
        }
      />

      <EngineRow
        anchor="downloadSources.usenet.minAgeHours"
        label={t("usenet.minAge.label")}
        description={t("usenet.minAge.description")}
        control={
          <SettingsNumberInput
            value={draft.minAgeHours}
            onChange={(v) => setField("minAgeHours", v)}
            min={0}
            max={720}
            suffix={t("usenet.minAge.suffix")}
            ariaLabel={t("usenet.minAge.ariaLabel")}
          />
        }
      />

      <EngineRow
        anchor="downloadSources.usenet.searchTimeout"
        label={t("usenet.searchTimeout.label")}
        description={t("usenet.searchTimeout.description")}
        control={
          <SettingsNumberInput
            value={Math.round(draft.searchTimeout / MS)}
            onChange={(v) => setField("searchTimeout", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t("usenet.searchTimeout.ariaLabel")}
          />
        }
      />

      <div role="separator" className={cardDivider()} />

      <div className="flex items-center gap-2">
        <span className={cardSectionHeader()}>{t("usenet.singleTrackRequests.title")}</span>
        <InfoTooltip
          title={t("usenet.singleTrackRequests.tooltipTitle")}
          description={t("usenet.singleTrackRequests.tooltipWhat")}
          secondary={t("usenet.singleTrackRequests.tooltipCost")}
          triggerLabel={t("usenet.singleTrackRequests.tooltipTriggerLabel")}
        />
      </div>

      <EngineRow
        anchor="downloadSources.usenet.singleTrackRequests"
        label={t("usenet.singleTrackRequests.label")}
        description={t("usenet.singleTrackRequests.description")}
        control={
          <Switch
            checked={draft.singleTrackRequests}
            onCheckedChange={(v) => setField("singleTrackRequests", v)}
            aria-label={t("usenet.singleTrackRequests.ariaLabel")}
          />
        }
      />

      {draft.singleTrackRequests ? (
        <EngineRow
          label={t("usenet.stagingRetention.label")}
          description={t("usenet.stagingRetention.description")}
          control={
            <SettingsNumberInput
              value={draft.stagingRetentionHours}
              onChange={(v) => setField("stagingRetentionHours", v)}
              min={1}
              max={168}
              suffix={t("usenet.stagingRetention.suffix")}
              ariaLabel={t("usenet.stagingRetention.ariaLabel")}
            />
          }
        />
      ) : null}

      {draft.singleTrackRequests ? <DownloadedAlbumsPointer /> : null}

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((usenet) => update.mutateAsync({ usenet }))}
        onCancel={reset}
      />
    </SettingsCard>
  );
}
