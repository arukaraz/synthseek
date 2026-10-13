"use client";

import { Plug } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";

import { useTestTorrentSource, useUpdateDownloadSources } from "@hooks/api/mutations/settings/useDownloadSources";
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
import { TORRENT_CLIENT_TEST_KEYS, TORRENT_INDEXER_TEST_KEYS, TORRENT_TEST_WARNING_KEYS } from "./constants";
import { DownloadedAlbumsPointer } from "./DownloadedAlbumsPointer";
import type { TorrentCardProps } from "./types";

export function TorrentCard({ initial }: TorrentCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateDownloadSources();
  const testConnection = useTestTorrentSource();
  const reveal = useRevealSettingsSecret();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial.torrent);
  const fieldId = useId();

  if (!draft) return null;

  const handleTest = async () => {
    const report = await testConnection.mutateAsync({
      indexerUrl: draft.indexerUrl,
      indexerApiKey: draft.indexerApiKey,
      qbittorrentUrl: draft.qbittorrentUrl,
      qbittorrentUsername: draft.qbittorrentUsername.trim(),
      qbittorrentPassword: draft.qbittorrentPassword,
      qbittorrentApiKey: draft.qbittorrentApiKey,
      category: draft.category.trim(),
    });
    if (report.indexer !== "ok") {
      toast.error(
        t(TORRENT_INDEXER_TEST_KEYS[report.indexer]),
        report.indexerReason === null ? undefined : { description: report.indexerReason }
      );
      return;
    }
    if (report.client !== "ok") {
      toast.error(
        t(TORRENT_CLIENT_TEST_KEYS[report.client]),
        report.clientReason === null ? undefined : { description: report.clientReason }
      );
      return;
    }
    const warnings = report.warnings.map((warning) => t(TORRENT_TEST_WARNING_KEYS[warning]));
    if (warnings.length > 0) toast.warning(t("torrent.test.ok"), { description: warnings.join(" ") });
    else toast.success(t("torrent.test.ok"));
  };

  return (
    <SettingsCard title={t("torrent.title")} optional description={t("torrent.description")}>
      <EngineRow
        label={t("torrent.enable.label")}
        description={t("torrent.enable.description")}
        control={
          <Switch
            checked={draft.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
            aria-label={t("torrent.enable.ariaLabel")}
          />
        }
      />

      <SettingsField label={t("torrent.indexerUrl.label")} htmlFor={`${fieldId}-indexer-url`}>
        <SettingsTextInput
          id={`${fieldId}-indexer-url`}
          value={draft.indexerUrl}
          onChange={(v) => setField("indexerUrl", v)}
          placeholder={t("torrent.indexerUrl.placeholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField label={t("torrent.indexerApiKey.label")} htmlFor={`${fieldId}-indexer-key`}>
        <SettingsSecretInput
          id={`${fieldId}-indexer-key`}
          value={draft.indexerApiKey}
          onChange={(v) => setField("indexerApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "downloadSources.torrent", field: "indexerApiKey" }),
          }}
        />
      </SettingsField>

      <SettingsField label={t("torrent.qbittorrentUrl.label")} htmlFor={`${fieldId}-client-url`}>
        <SettingsTextInput
          id={`${fieldId}-client-url`}
          value={draft.qbittorrentUrl}
          onChange={(v) => setField("qbittorrentUrl", v)}
          placeholder={t("torrent.qbittorrentUrl.placeholder")}
          type="url"
        />
      </SettingsField>

      <SettingsField
        label={t("torrent.qbittorrentApiKey.label")}
        helper={t("torrent.qbittorrentApiKey.hint")}
        htmlFor={`${fieldId}-client-key`}
      >
        <SettingsSecretInput
          id={`${fieldId}-client-key`}
          value={draft.qbittorrentApiKey}
          onChange={(v) => setField("qbittorrentApiKey", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "downloadSources.torrent", field: "qbittorrentApiKey" }),
          }}
        />
      </SettingsField>

      <SettingsField label={t("torrent.qbittorrentUsername.label")} htmlFor={`${fieldId}-client-username`}>
        <SettingsTextInput
          id={`${fieldId}-client-username`}
          value={draft.qbittorrentUsername}
          onChange={(v) => setField("qbittorrentUsername", v)}
        />
      </SettingsField>

      <SettingsField label={t("torrent.qbittorrentPassword.label")} htmlFor={`${fieldId}-client-password`}>
        <SettingsSecretInput
          id={`${fieldId}-client-password`}
          value={draft.qbittorrentPassword}
          onChange={(v) => setField("qbittorrentPassword", v)}
          source={{
            kind: "stored",
            reveal: () => reveal({ section: "downloadSources.torrent", field: "qbittorrentPassword" }),
          }}
        />
      </SettingsField>

      <SettingsField
        label={t("torrent.category.label")}
        helper={t("torrent.category.hint")}
        htmlFor={`${fieldId}-category`}
      >
        <SettingsTextInput
          id={`${fieldId}-category`}
          value={draft.category}
          onChange={(v) => setField("category", v)}
        />
      </SettingsField>

      <EngineRow
        label={t("torrent.minSeeders.label")}
        description={t("torrent.minSeeders.description")}
        control={
          <SettingsNumberInput
            value={draft.minSeeders}
            onChange={(v) => setField("minSeeders", v)}
            min={0}
            max={100}
            ariaLabel={t("torrent.minSeeders.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("torrent.maxSize.label")}
        description={t("torrent.maxSize.description")}
        control={
          <SettingsNumberInput
            value={draft.maxSizeMb}
            onChange={(v) => setField("maxSizeMb", v)}
            min={0}
            max={100000}
            suffix={t("torrent.maxSize.suffix")}
            ariaLabel={t("torrent.maxSize.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("torrent.stallTimeout.label")}
        description={t("torrent.stallTimeout.description")}
        control={
          <SettingsNumberInput
            value={draft.stallTimeoutMinutes}
            onChange={(v) => setField("stallTimeoutMinutes", v)}
            min={1}
            max={360}
            suffix={t("torrent.stallTimeout.suffix")}
            ariaLabel={t("torrent.stallTimeout.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("torrent.queueTimeout.label")}
        description={t("torrent.queueTimeout.description")}
        control={
          <SettingsNumberInput
            value={draft.queueTimeoutHours}
            onChange={(v) => setField("queueTimeoutHours", v)}
            min={1}
            max={168}
            suffix={t("torrent.queueTimeout.suffix")}
            ariaLabel={t("torrent.queueTimeout.ariaLabel")}
          />
        }
      />

      <div role="separator" className={cardDivider()} />

      <div className="flex items-center gap-2">
        <span className={cardSectionHeader()}>{t("torrent.singleTrackRequests.title")}</span>
        <InfoTooltip
          title={t("torrent.singleTrackRequests.tooltipTitle")}
          description={t("torrent.singleTrackRequests.tooltipWhat")}
          secondary={t("torrent.singleTrackRequests.tooltipCost")}
          triggerLabel={t("torrent.singleTrackRequests.tooltipTriggerLabel")}
        />
      </div>

      <EngineRow
        label={t("torrent.singleTrackRequests.label")}
        description={t("torrent.singleTrackRequests.description")}
        control={
          <Switch
            checked={draft.singleTrackRequests}
            onCheckedChange={(v) => setField("singleTrackRequests", v)}
            aria-label={t("torrent.singleTrackRequests.ariaLabel")}
          />
        }
      />

      <EngineRow
        label={t("torrent.stagingRetention.label")}
        description={t("torrent.stagingRetention.description")}
        control={
          <SettingsNumberInput
            value={draft.stagingRetentionHours}
            onChange={(v) => setField("stagingRetentionHours", v)}
            min={1}
            max={168}
            suffix={t("torrent.stagingRetention.suffix")}
            ariaLabel={t("torrent.stagingRetention.ariaLabel")}
          />
        }
      />

      <DownloadedAlbumsPointer />

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testConnection.isPending || !draft.indexerUrl || !draft.qbittorrentUrl}
        >
          <Plug className="size-4" />
          {testConnection.isPending ? t("torrent.test.testing") : t("torrent.test.action")}
        </Button>
      </div>

      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() =>
          save((payload) =>
            update.mutateAsync({
              ...initial,
              torrent: {
                ...payload,
                qbittorrentUsername: payload.qbittorrentUsername.trim(),
                category: payload.category.trim(),
              },
            })
          )
        }
        onCancel={reset}
      />
    </SettingsCard>
  );
}
