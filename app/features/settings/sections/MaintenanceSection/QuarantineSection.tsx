"use client";

import { ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { HashLink } from "@components/HashLink";
import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { EmptyState } from "@components/ui/EmptyState";
import { IconButton } from "@components/ui/IconButton";
import { Switch } from "@components/ui/Switch";

import { useClearQuarantine, useRemoveQuarantineEntry } from "@hooks/api/mutations/settings/useQuarantine";
import { useUpdateEngineImport } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useQuarantineList } from "@hooks/api/queries/useQuarantine";
import { useClientPagination } from "@hooks/ui/useClientPagination";
import { Pagination } from "@components/ui/Pagination";
import { downloadSourceLabelKey } from "@utils/download-source";
import { formatRelativeTime } from "@utils/formatters";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { QUARANTINE_FILENAME_MAX } from "./constants";
import { truncateMiddle } from "./helpers";
import {
  quarantineFilename,
  quarantineLink,
  quarantineList,
  quarantineListHeader,
  quarantineMeta,
  quarantineReasonBadge,
  quarantineRow,
  quarantineRowBody,
  quarantineValue,
} from "./styles";
import type { QuarantineCardProps } from "./types";

export function QuarantineSection({ initial, sourceTrust }: QuarantineCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEngineImport();
  const entries = useQuarantineList();
  const quarantined = useClientPagination(entries.data);
  const removeEntry = useRemoveQuarantineEntry();
  const clearAll = useClearQuarantine();
  const { draft, setField, save, reset, isDirty, isSaving } = useSettingsForm(initial);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!draft) return null;

  const hasEntries = Boolean(entries.data && entries.data.length > 0);

  return (
    <SettingsCard title={t("quarantine.title")} description={t("quarantine.description")} className="lg:col-span-2">
      <EngineRow
        label={t("quarantine.identityGate.label")}
        description={t("quarantine.identityGate.description")}
        control={
          <Switch
            checked={draft.acoustidIdentityGate}
            onCheckedChange={(v) => setField("acoustidIdentityGate", v)}
            aria-label={t("quarantine.identityGate.label")}
          />
        }
      />
      <SaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={() => save((payload) => update.mutateAsync(payload))}
        onCancel={reset}
      />

      <p className="text-fg/55 text-xs">
        <Trans
          t={t}
          i18nKey="quarantine.reviewQueue.hint"
          components={{
            review: <HashLink href="/requests#review" className={quarantineLink()} />,
          }}
        />
      </p>

      <div role="separator" className={cardDivider()} />
      <div className={quarantineListHeader()}>
        <span className={cardSectionHeader()}>{t("quarantine.list.title")}</span>
        {hasEntries ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={clearAll.isPending}>
            <Trash2 className="size-4" />
            {t("quarantine.list.clearAll")}
          </Button>
        ) : null}
      </div>

      {entries.isLoading ? (
        <span className="text-fg/60 text-sm">{t("quarantine.list.loading")}</span>
      ) : entries.isError ? (
        <span className="text-sm text-red-400">{t("quarantine.list.loadError")}</span>
      ) : !hasEntries ? (
        <EmptyState
          icon={ShieldCheck}
          title={t("quarantine.list.empty.title")}
          description={t("quarantine.list.empty.description")}
        />
      ) : (
        <ul className={quarantineList()}>
          {quarantined.visible.map((entry) => {
            const sourceKey = downloadSourceLabelKey(entry.source);
            return (
              <li key={entry.id} className={quarantineRow()}>
                <div className={quarantineRowBody()}>
                  <span className={quarantineFilename()} title={entry.filename}>
                    {truncateMiddle(entry.filename, QUARANTINE_FILENAME_MAX)}
                  </span>
                  <div className={quarantineMeta()}>
                    <span title={t("quarantine.list.columns.source")}>{sourceKey ? t(sourceKey) : entry.source}</span>
                    {entry.username.length > 0 ? (
                      <span title={t("quarantine.list.columns.peer")}>{entry.username}</span>
                    ) : null}
                    <span className={quarantineReasonBadge()} title={t("quarantine.list.columns.reason")}>
                      {t(`quarantine.reason.${entry.reason}`)}
                    </span>
                    <span title={t("quarantine.list.columns.age")}>{formatRelativeTime(entry.createdAt)}</span>
                    {entry.track ? (
                      <span title={t("quarantine.list.columns.track")}>
                        {t("quarantine.list.trackDisplay", {
                          title: entry.track.title,
                          artist: entry.track.artist,
                        })}
                      </span>
                    ) : null}
                  </div>
                </div>
                <IconButton
                  icon={X}
                  size="sm"
                  aria-label={t("quarantine.list.remove")}
                  onClick={() => removeEntry.mutate({ id: entry.id })}
                  disabled={removeEntry.isPending || clearAll.isPending}
                />
              </li>
            );
          })}
        </ul>
      )}

      {quarantined.paginated ? (
        <Pagination
          page={quarantined.page}
          pageCount={quarantined.pageCount}
          pageSize={quarantined.pageSize}
          totalItems={quarantined.totalItems}
          pageSizeOptions={quarantined.pageSizeOptions}
          onPageChange={quarantined.onPageChange}
          onPageSizeChange={quarantined.onPageSizeChange}
        />
      ) : null}

      <div role="separator" className={cardDivider()} />
      <span className={cardSectionHeader()}>{t("quarantine.sourceTrust.title")}</span>
      <p className="text-fg/55 text-xs">
        <Trans
          t={t}
          i18nKey="quarantine.sourceTrust.manage"
          components={{
            slskd: (
              <HashLink href="/settings/integrations/download-sources#ban-threshold" className={quarantineLink()} />
            ),
          }}
        />
      </p>
      <EngineRow
        label={t("quarantine.sourceTrust.bannedUploaders.label")}
        description={t("quarantine.sourceTrust.bannedUploaders.description")}
        control={<span className={quarantineValue()}>{sourceTrust.bannedUsersCount}</span>}
      />
      <EngineRow
        label={t("quarantine.sourceTrust.autoBan.label")}
        description={t("quarantine.sourceTrust.autoBan.description")}
        control={
          <span className={quarantineValue()}>
            {sourceTrust.banAfterFailedAttempts > 0
              ? sourceTrust.banAfterFailedAttempts
              : t("quarantine.sourceTrust.autoBan.off")}
          </span>
        }
      />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => clearAll.mutate()}
        title={t("quarantine.list.confirmClear.title")}
        message={t("quarantine.list.confirmClear.message")}
        confirmText={t("quarantine.list.confirmClear.confirm")}
        variant="danger"
      />
    </SettingsCard>
  );
}
