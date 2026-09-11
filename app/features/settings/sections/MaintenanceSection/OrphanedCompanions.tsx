"use client";

import { Brush } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ConfirmationModal } from "@components/ui/ConfirmationModal";
import { useSweepOrphanedCompanions } from "@hooks/api/mutations/settings/useOrphanedCompanions";
import { useOrphanedCompanions } from "@hooks/api/queries/useOrphanedCompanions";
import { formatBytes } from "@utils/formatters";

import { EngineRow } from "../../components/EngineRow";
import { cardDivider, cardSectionHeader } from "../../styles";
import { quarantineListHeader, quarantineValue } from "./styles";

export function OrphanedCompanions() {
  const { t } = useTranslation("settings");
  const [expanded, setExpanded] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const orphans = useOrphanedCompanions(expanded);
  const sweep = useSweepOrphanedCompanions();

  const found = orphans.data?.count ?? 0;

  return (
    <>
      <div role="separator" className={cardDivider()} />
      <div className={quarantineListHeader()}>
        <span className={cardSectionHeader()}>{t("quality.orphanedCompanions.sectionTitle")}</span>
        {expanded && found > 0 ? (
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} disabled={sweep.isPending}>
            <Brush className="size-4" />
            {t("quality.orphanedCompanions.sweep.action")}
          </Button>
        ) : null}
      </div>

      {!expanded ? (
        <EngineRow
          label={t("quality.orphanedCompanions.check.label")}
          description={t("quality.orphanedCompanions.check.description")}
          control={
            <Button variant="outline" size="sm" onClick={() => setExpanded(true)}>
              {t("quality.orphanedCompanions.check.action")}
            </Button>
          }
        />
      ) : orphans.isLoading ? (
        <span className="text-fg/60 text-sm">{t("quality.orphanedCompanions.status.loading")}</span>
      ) : orphans.isError ? (
        <span className="text-sm text-red-400">{t("quality.orphanedCompanions.status.loadError")}</span>
      ) : orphans.data ? (
        <>
          <EngineRow
            label={t("quality.orphanedCompanions.status.found.label")}
            description={t("quality.orphanedCompanions.status.found.description")}
            control={<span className={quarantineValue()}>{orphans.data.count}</span>}
          />
          <EngineRow
            label={t("quality.orphanedCompanions.status.size.label")}
            description={t("quality.orphanedCompanions.status.size.description")}
            control={<span className={quarantineValue()}>{formatBytes(orphans.data.totalBytes)}</span>}
          />
          {orphans.data.directoriesUnreadable > 0 ? (
            <EngineRow
              label={t("quality.orphanedCompanions.status.unreadable.label")}
              description={t("quality.orphanedCompanions.status.unreadable.description")}
              control={<span className={quarantineValue()}>{orphans.data.directoriesUnreadable}</span>}
            />
          ) : null}
          {orphans.data.sample.length > 0 ? (
            <ul className="text-fg/60 space-y-1 text-xs">
              {orphans.data.sample.map((entry) => (
                <li key={entry} className="truncate">
                  {entry}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          sweep.mutate();
          setConfirmOpen(false);
        }}
        title={t("quality.orphanedCompanions.sweep.confirmTitle")}
        message={t("quality.orphanedCompanions.sweep.confirmMessage", { count: found })}
        confirmText={t("quality.orphanedCompanions.sweep.confirm")}
      />
    </>
  );
}
