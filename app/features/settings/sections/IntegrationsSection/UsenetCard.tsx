"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";

import { useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { StagedReleaseList } from "./StagedReleaseList";
import type { UsenetCardProps } from "./types";

export function UsenetCard({ initial }: UsenetCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial.usenet);

  if (!draft) return null;

  return (
    <SettingsCard title={t("usenet.title")} optional description={t("usenet.description")}>
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

      <SettingsField label={t("usenet.indexerUrl.label")}>
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
          ariaLabel={t("usenet.indexerApiKey.label")}
        />
      </SettingsField>

      <SettingsField label={t("usenet.sabnzbdUrl.label")}>
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
          ariaLabel={t("usenet.sabnzbdApiKey.label")}
        />
      </SettingsField>

      <EngineRow
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

      {draft.singleTrackRequests ? <StagedReleaseList enabled={draft.enabled} /> : null}

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() =>
          save((payload) => update.mutateAsync({ slskd: initial.slskd, ytdlp: initial.ytdlp, usenet: payload }))
        }
        onCancel={reset}
      />
    </SettingsCard>
  );
}
