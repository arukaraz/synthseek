"use client";

import { useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import {
  useCancelLibraryOrganise,
  useStartLibraryOrganise,
} from "@hooks/api/mutations/library/useLibraryOrganiseControls";
import { useLibraryOrganisePreview, useLibraryOrganiseStatus } from "@hooks/api/queries/useLibraryOrganise";

import { SettingsCard } from "../../components/SettingsCard";
import { scanActions, scanStat, scanStatGrid, scanStatLabel, scanStatValue } from "../../styles";
import { DEFAULT_SELECTION, MOVE_CLASSES } from "./constants";
import { chosenClasses, chosenTotal, countFor, percentDone, runOutcome } from "./helpers";
import { OrganiseGroupRow } from "./OrganiseGroupRow";
import type { GroupSelection } from "./types";

export function OrganiseCard() {
  const { t } = useTranslation("settings");
  const [selection, setSelection] = useState<GroupSelection>(DEFAULT_SELECTION);
  const status = useLibraryOrganiseStatus();
  const running = status.data?.running === true;
  const preview = useLibraryOrganisePreview(!running, chosenClasses(selection));
  const start = useStartLibraryOrganise();
  const cancel = useCancelLibraryOrganise();

  if (preview.isLoading && !running) {
    return (
      <SettingsCard title={t("libraryOrganise.card.title")} description={t("libraryOrganise.card.description")}>
        <span className="text-fg/60 text-sm">{t("jobs.card.loading")}</span>
      </SettingsCard>
    );
  }

  if (preview.isError) {
    return (
      <SettingsCard title={t("libraryOrganise.card.title")} description={t("libraryOrganise.card.description")}>
        <Notice variant="danger" title={t("libraryOrganise.error")} />
      </SettingsCard>
    );
  }

  const data = preview.data;
  const chosen = chosenTotal(data, selection);
  const outcome = runOutcome(status.data);

  return (
    <SettingsCard title={t("libraryOrganise.card.title")} description={t("libraryOrganise.card.description")}>
      <div className={scanStatGrid()}>
        <div className={scanStat()}>
          <span className={scanStatLabel()}>{t("libraryOrganise.stats.inPlace")}</span>
          <span className={scanStatValue()}>{(data?.inPlace ?? 0).toLocaleString()}</span>
        </div>
        <div className={scanStat()}>
          <span className={scanStatLabel()}>{t("libraryOrganise.stats.toMove")}</span>
          <span className={scanStatValue()}>{(data?.moves ?? 0).toLocaleString()}</span>
        </div>
        <div className={scanStat()}>
          <span className={scanStatLabel()}>{t("libraryOrganise.stats.rejected")}</span>
          <span className={scanStatValue()}>{(data?.rejected ?? 0).toLocaleString()}</span>
        </div>
        <div className={scanStat()}>
          <span className={scanStatLabel()}>{t("libraryOrganise.stats.companions")}</span>
          <span className={scanStatValue()}>{(data?.companionsMoving ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col">
        {MOVE_CLASSES.map((moveClass) => (
          <OrganiseGroupRow
            key={moveClass}
            moveClass={moveClass}
            count={countFor(data, moveClass)}
            checked={selection[moveClass]}
            disabled={running}
            onToggle={(next) => setSelection((current) => ({ ...current, [moveClass]: next }))}
          />
        ))}
      </div>

      {selection.rename && countFor(data, "rename") > 0 ? (
        <Notice variant="warning" title={t("libraryOrganise.renameWarning", { count: countFor(data, "rename") })} />
      ) : null}

      {data && data.rejected > 0 ? (
        <Notice variant="info" title={t("libraryOrganise.rejectedNotice", { count: data.rejected })}>
          <ul className="flex flex-col gap-0.5">
            {data.rejectionsByReason.map((entry) => (
              <li key={entry.reason}>{t(`libraryOrganise.rejectedReason.${entry.reason}`, { count: entry.count })}</li>
            ))}
          </ul>
          <ul className="mt-2 flex flex-col gap-0.5 opacity-70">
            {data.rejectionSample.map((item) => (
              <li key={item.relativePath} className="truncate">
                {item.relativePath}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {data && data.companionsLeftByReason.length > 0 ? (
        <Notice variant="info" title={t("libraryOrganise.companionsLeftNotice")}>
          <ul className="flex flex-col gap-0.5">
            {data.companionsLeftByReason.map((entry) => (
              <li key={entry.reason}>{t(`libraryOrganise.companionsLeft.${entry.reason}`, { count: entry.count })}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {running && status.data ? (
        <p className="text-fg/70 mt-3 text-sm tabular-nums">
          {t("libraryOrganise.progress", {
            processed: status.data.processed,
            total: status.data.total,
            percent: percentDone(status.data.processed, status.data.total),
          })}
          {status.data.companionsMoved > 0
            ? ` ${t("libraryOrganise.companionsProgress", { count: status.data.companionsMoved })}`
            : null}
          {status.data.companionsFailed > 0
            ? ` ${t("libraryOrganise.companionsFailed", { count: status.data.companionsFailed })}`
            : null}
        </p>
      ) : null}

      {outcome ? (
        <Notice
          variant={outcome.failed > 0 || outcome.companionsFailed > 0 || outcome.abandoned > 0 ? "warning" : "success"}
          title={t("libraryOrganise.finished", {
            moved: outcome.moved,
            companions: outcome.companionsMoved,
            duration: outcome.duration,
          })}
        >
          {outcome.abandoned > 0 ? (
            <p className="mb-1">{t("libraryOrganise.finishedAbandoned", { count: outcome.abandoned })}</p>
          ) : null}
          {outcome.failed > 0 ? (
            <>
              <p>{t("libraryOrganise.finishedFailures", { count: outcome.failed })}</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {outcome.failures.map((failure) => (
                  <li key={failure.from} className="truncate">
                    {failure.from} → {failure.to}: {t(`libraryOrganise.moveFailure.${failure.reason}`)}
                  </li>
                ))}
              </ul>
              {outcome.failed > outcome.listedFailures ? (
                <p className="mt-1">
                  {t("libraryOrganise.finishedFailuresTruncated", {
                    listed: outcome.listedFailures,
                    count: outcome.failed,
                  })}
                </p>
              ) : null}
            </>
          ) : null}
          {outcome.companionsFailed > 0 ? (
            <p className="mt-1">{t("libraryOrganise.finishedCompanionsFailed", { count: outcome.companionsFailed })}</p>
          ) : null}
        </Notice>
      ) : null}

      {data && data.moveSample.length > 0 && !running ? (
        <ul className="text-fg/60 mt-3 flex flex-col gap-1 text-xs">
          {data.moveSample.map((move) => (
            <li key={move.from} className="truncate">
              {move.from} → {move.to}
            </li>
          ))}
        </ul>
      ) : null}

      <div className={scanActions()}>
        {running ? (
          <Button variant="secondary" onClick={() => cancel.mutate()} disabled={status.data?.cancelling === true}>
            <Square className="size-4" />
            {t("libraryOrganise.actions.stop")}
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (data === undefined) return;
              start.mutate({ classes: chosenClasses(selection), seal: data.seal });
            }}
            disabled={chosen === 0 || data === undefined || preview.isFetching || start.isPending}
          >
            {start.isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {t("libraryOrganise.actions.apply", { count: chosen })}
          </Button>
        )}
      </div>
    </SettingsCard>
  );
}
