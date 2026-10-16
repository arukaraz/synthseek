"use client";

import { ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { HashLink } from "@components/HashLink";
import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { EmptyState } from "@components/ui/EmptyState";
import { Switch } from "@components/ui/Switch";

import { useClearQuarantine, useRemoveQuarantineEntry } from "@hooks/api/mutations/settings/useQuarantine";
import { useUpdateEngineImport } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useQuarantineList } from "@hooks/api/queries/useQuarantine";
import { useClientPagination } from "@hooks/ui/useClientPagination";
import { Pagination } from "@components/ui/Pagination";

import { EngineRow } from "../../components/EngineRow";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsForm } from "../../hooks/useSettingsForm";
import { cardDivider, cardSectionHeader } from "../../styles";
import { QuarantineGroupRow } from "./QuarantineGroupRow";
import { quarantineLink, quarantineList, quarantineListHeader, quarantineValue } from "./styles";
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
        anchor="engine.import.acoustidIdentityGate"
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
          {quarantined.visible.map((group) => (
            <QuarantineGroupRow
              key={JSON.stringify([group.source, group.username, group.filename])}
              group={group}
              removing={removeEntry.isPending || clearAll.isPending}
              onRemove={({ source, username, filename }) => removeEntry.mutate({ source, username, filename })}
            />
          ))}
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
              <HashLink href="/settings/download-sources?source=slskd#ban-threshold" className={quarantineLink()} />
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
