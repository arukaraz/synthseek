"use client";

import { Disc3, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { EmptyState } from "@components/ui/EmptyState";
import { IconButton } from "@components/ui/IconButton";
import { Spinner } from "@components/ui/Spinner";

import { useClearStagedReleases, useRemoveStagedRelease } from "@hooks/api/mutations/settings/useStagedReleases";
import { useStagedReleases } from "@hooks/api/queries/useStagedReleases";
import { formatBytes, formatRelativeTime, formatTimeUntil } from "@utils/formatters";

import { cardSectionHeader } from "../../styles";
import { STAGED_LIST_KEYS } from "./constants";
import { stagedList, stagedListHeader, stagedMeta, stagedRow, stagedRowBody, stagedTitle } from "./styles";
import type { StagedReleaseListProps } from "./types";

export function StagedReleaseList({ enabled, source }: StagedReleaseListProps) {
  const { t } = useTranslation("settings");
  const keys = STAGED_LIST_KEYS[source];
  const entries = useStagedReleases(enabled);
  const removeEntry = useRemoveStagedRelease();
  const clearAll = useClearStagedReleases();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const ownEntries = (entries.data ?? []).filter((entry) => entry.source === source);
  const hasEntries = ownEntries.length > 0;
  const busy = removeEntry.isPending || clearAll.isPending;

  return (
    <>
      <div className={stagedListHeader()}>
        <span className={cardSectionHeader()}>{t(keys.title)}</span>
        {hasEntries ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={busy}>
            {clearAll.isPending ? <Spinner size="sm" /> : <Trash2 className="size-4" />}
            {t(keys.clearAll)}
          </Button>
        ) : null}
      </div>

      {entries.isLoading ? (
        <span className="text-fg/60 text-sm">{t(keys.loading)}</span>
      ) : entries.isError ? (
        <span className="text-destructive-vivid text-sm">{t(keys.loadError)}</span>
      ) : !hasEntries ? (
        <EmptyState icon={Disc3} title={t(keys.emptyTitle)} description={t(keys.emptyDescription)} />
      ) : (
        <ul className={stagedList()}>
          {ownEntries.map((entry) => (
            <li key={entry.id} className={stagedRow()}>
              <div className={stagedRowBody()}>
                <span className={stagedTitle()} title={entry.releaseTitle}>
                  {entry.releaseTitle}
                </span>
                <div className={stagedMeta()}>
                  <span>{formatBytes(entry.sizeBytes)}</span>
                  <span>{formatRelativeTime(entry.lastUsedAt)}</span>
                  <span>{t(keys.expiresIn, { when: formatTimeUntil(entry.expiresAt) })}</span>
                </div>
              </div>
              <IconButton
                icon={X}
                size="sm"
                aria-label={t(keys.remove)}
                onClick={() => removeEntry.mutate({ id: entry.id })}
                disabled={busy}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => clearAll.mutate({ source })}
        title={t(keys.confirmTitle)}
        message={t(keys.confirmMessage)}
        confirmText={t(keys.confirm)}
        variant="danger"
      />
    </>
  );
}
