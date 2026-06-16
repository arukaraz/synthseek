"use client";

import { Plug } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";

import { useTestSlskd, useUpdateConnectionsSlskd } from "@hooks/api/mutations/settings/useUpdateConnections";
import { useUpdateEngineSearch, useUpdateEngineTimeouts } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useSlskdStatus } from "@hooks/api/queries/useSlskdStatus";
import { validateSlskdApiUrl } from "@utils/slskd-url";
import { EngineRow } from "../../components/EngineRow";
import { ListManager } from "../../components/ListManager";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsNumberInput } from "../../components/SettingsNumberInput";
import { SettingsSecretInput } from "../../components/SettingsSecretInput";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader, fieldError, fieldWarning } from "../../styles";
import { MS } from "./constants";
import { SlskdStatusBadge } from "./SlskdStatusBadge";
import type { SlskdCardProps } from "./types";

export function SlskdCard({ initial }: SlskdCardProps) {
  const { t } = useTranslation("settings");
  const updateConnection = useUpdateConnectionsSlskd();
  const updateSearch = useUpdateEngineSearch();
  const updateTimeouts = useUpdateEngineTimeouts();
  const testConnection = useTestSlskd();
  const status = useSlskdStatus();
  const connectionForm = useSettingsForm(initial.connection);
  const searchForm = useSettingsForm(initial.search);
  const timeoutsForm = useSettingsForm(initial.timeouts);
  const [testing, setTesting] = useState(false);

  if (!connectionForm.draft || !searchForm.draft || !timeoutsForm.draft) return null;

  const connection = connectionForm.draft;
  const search = searchForm.draft;
  const timeouts = timeoutsForm.draft;

  const urlCheck = validateSlskdApiUrl(connection.apiUrl);
  const urlError = connection.apiUrl.length > 0 && !urlCheck.ok ? urlCheck.error : undefined;
  const urlWarning = urlCheck.ok ? urlCheck.warning : undefined;

  const isDirty = connectionForm.isDirty || searchForm.isDirty || timeoutsForm.isDirty;
  const isSaving = connectionForm.isSaving || searchForm.isSaving || timeoutsForm.isSaving;

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testConnection.mutateAsync({ apiUrl: urlCheck.normalized, apiKey: connection.apiKey });
      if (result.ok) toast.success(result.message ?? t("slskd.connected"));
      else toast.error(result.message ?? t("slskd.connectionFailed"));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    connectionForm.setField("apiUrl", urlCheck.normalized);
    const promises: Promise<unknown>[] = [];
    if (connectionForm.isDirty) {
      promises.push(
        connectionForm.save((payload) => updateConnection.mutateAsync({ ...payload, apiUrl: urlCheck.normalized }))
      );
    }
    if (searchForm.isDirty) promises.push(searchForm.save((payload) => updateSearch.mutateAsync(payload)));
    if (timeoutsForm.isDirty) promises.push(timeoutsForm.save((payload) => updateTimeouts.mutateAsync(payload)));
    await Promise.all(promises);
  };

  const handleCancel = () => {
    connectionForm.reset();
    searchForm.reset();
    timeoutsForm.reset();
  };

  return (
    <SettingsCard
      title={t("slskd.title")}
      description={t("slskd.description")}
      trailing={
        status.data ? (
          <SlskdStatusBadge
            status={status.data.status}
            message={status.data.message !== "Connected" ? status.data.message : undefined}
            messageCode={status.data.messageCode !== "SLSKD_CONNECTED" ? status.data.messageCode : undefined}
            messageParams={status.data.messageParams}
          />
        ) : null
      }
    >
      <SettingsField label={t("slskd.apiUrl.label")} helper="">
        <SettingsTextInput
          value={connection.apiUrl}
          onChange={(v) => connectionForm.setField("apiUrl", v)}
          placeholder={t("slskd.apiUrl.placeholder")}
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

      <SettingsField label={t("slskd.apiKey.label")}>
        <SettingsSecretInput value={connection.apiKey} onChange={(v) => connectionForm.setField("apiKey", v)} />
      </SettingsField>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testing || !connection.apiUrl || !connection.apiKey || Boolean(urlError)}
        >
          <Plug className="size-4" />
          {testing ? t("slskd.testing") : t("slskd.testConnection")}
        </Button>
      </div>

      <div role="separator" className={cardDivider()} />
      <span className={cardSectionHeader()}>{t("search.title")}</span>

      <EngineRow
        label={t("search.maxPeerAttempts.label")}
        description={t("search.maxPeerAttempts.description")}
        control={
          <SettingsNumberInput
            value={search.maxPeerAttempts}
            onChange={(v) => searchForm.setField("maxPeerAttempts", v)}
            min={1}
            max={50}
            ariaLabel={t("search.maxPeerAttempts.label")}
          />
        }
      />
      <EngineRow
        label={t("search.maxVariations.label")}
        description={t("search.maxVariations.description")}
        control={
          <SettingsNumberInput
            value={search.maxVariations}
            onChange={(v) => searchForm.setField("maxVariations", v)}
            min={1}
            max={20}
            ariaLabel={t("search.maxVariations.label")}
          />
        }
      />
      <EngineRow
        label={t("search.historyCleanup.label")}
        description={t("search.historyCleanup.description")}
        control={
          <Switch
            checked={search.historyCleanupEnabled}
            onCheckedChange={(v) => searchForm.setField("historyCleanupEnabled", v)}
            aria-label={t("search.historyCleanup.label")}
          />
        }
      />
      <EngineRow
        label={t("search.maxHistorySearches.label")}
        description={t("search.maxHistorySearches.description")}
        control={
          <SettingsNumberInput
            value={search.maxHistorySearches}
            onChange={(v) => searchForm.setField("maxHistorySearches", v)}
            min={5}
            max={100}
            ariaLabel={t("search.maxHistorySearches.label")}
          />
        }
      />
      <EngineRow
        label={t("search.autoBan.label")}
        anchor="ban-threshold"
        description={t("search.autoBan.description")}
        control={
          <SettingsNumberInput
            value={search.banAfterFailedAttempts}
            onChange={(v) => searchForm.setField("banAfterFailedAttempts", v)}
            min={0}
            max={20}
            ariaLabel={t("search.autoBan.ariaLabel")}
          />
        }
      />

      <SettingsField
        label={t("slskd.bannedUploaders.label")}
        contentSpacing="loose"
        labelTrailing={
          <InfoTooltip
            description={t("slskd.bannedUploaders.tooltipWhat")}
            secondary={t("slskd.bannedUploaders.tooltipAuto")}
            triggerLabel={t("slskd.bannedUploaders.tooltipTriggerLabel")}
          />
        }
      >
        <ListManager
          value={connection.bannedUsers}
          onChange={(v) => connectionForm.setField("bannedUsers", v)}
          addPlaceholder={t("slskd.bannedUploaders.addPlaceholder")}
          filterPlaceholder={t("slskd.bannedUploaders.filterPlaceholder")}
          emptyLabel={t("slskd.bannedUploaders.empty")}
          countLabel={(n) => t("slskd.bannedUploaders.count", { count: n })}
          helper={
            <Trans
              t={t}
              i18nKey="slskd.bannedUploaders.helper"
              components={{
                threshold: (
                  <Link
                    href="/settings/integrations/download-sources#ban-threshold"
                    className="text-primary-400 hover:text-primary-300 underline-offset-2 hover:underline"
                  />
                ),
              }}
            />
          }
        />
      </SettingsField>

      <div role="separator" className={cardDivider()} />
      <span className={cardSectionHeader()}>{t("timeouts.title")}</span>

      <EngineRow
        label={t("timeouts.searchPhase.label")}
        description={t("timeouts.searchPhase.description")}
        control={
          <SettingsNumberInput
            value={Math.round(timeouts.searchPhase / MS)}
            onChange={(v) => timeoutsForm.setField("searchPhase", v * MS)}
            min={5}
            max={120}
            suffix="s"
            ariaLabel={t("timeouts.searchPhase.ariaLabel")}
          />
        }
      />
      <EngineRow
        label={t("timeouts.peerUnresponsive.label")}
        description={t("timeouts.peerUnresponsive.description")}
        control={
          <SettingsNumberInput
            value={Math.round(timeouts.peerUnresponsive / MS)}
            onChange={(v) => timeoutsForm.setField("peerUnresponsive", v * MS)}
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
            value={Math.round(timeouts.queueWaitActivePeer / MS)}
            onChange={(v) => timeoutsForm.setField("queueWaitActivePeer", v * MS)}
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
            value={Math.round(timeouts.queueWaitIdlePeer / MS)}
            onChange={(v) => timeoutsForm.setField("queueWaitIdlePeer", v * MS)}
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
        saveDisabled={Boolean(urlError)}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </SettingsCard>
  );
}
