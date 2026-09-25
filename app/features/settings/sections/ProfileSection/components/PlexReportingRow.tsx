"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Switch } from "@components/ui/Switch";
import { usePlaybackSourceAccounts, useSetSourceReporting } from "@hooks/api";

import { PLEX_SOURCE_KEY, REPORT_FAILURE_KEYS } from "../constants";
import { reportingNote } from "../styles";
import type { PlexReportingRowProps } from "../types";

export function PlexReportingRow({ onRelink, relinking }: PlexReportingRowProps) {
  const { t } = useTranslation("settings");
  const accounts = usePlaybackSourceAccounts();
  const setReporting = useSetSourceReporting();
  const plex = accounts.data?.find((account) => account.server === PLEX_SOURCE_KEY);
  if (plex === undefined) return null;

  if (!plex.connected) {
    return (
      <div className={reportingNote()}>
        <p className="text-fg/60 min-w-0 flex-1 text-xs">{t("profile.connected.plex.reporting.relinkHint")}</p>
        <Button variant="outline" size="sm" onClick={onRelink} disabled={relinking}>
          {t("profile.connected.plex.reporting.relink")}
        </Button>
      </div>
    );
  }

  const failureKey = plex.lastFailure === null ? undefined : REPORT_FAILURE_KEYS[plex.lastFailure];

  return (
    <div className={reportingNote()}>
      <div className="min-w-0 flex-1">
        <p className="text-fg text-xs font-medium">{t("profile.connected.plex.reporting.label")}</p>
        <p className="text-fg/50 text-xs">{t("profile.connected.plex.reporting.description")}</p>
        {failureKey !== undefined ? <p className="text-warning-vivid mt-1 text-xs">{t(failureKey)}</p> : null}
      </div>
      <Switch
        checked={plex.reportEnabled}
        onCheckedChange={(enabled) => setReporting.mutate({ server: PLEX_SOURCE_KEY, enabled })}
        disabled={setReporting.isPending}
        aria-label={t("profile.connected.plex.reporting.label")}
      />
    </div>
  );
}
