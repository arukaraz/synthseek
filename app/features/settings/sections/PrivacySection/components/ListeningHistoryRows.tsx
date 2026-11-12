"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { Switch } from "@components/ui/Switch";
import { usePrivacyOverview, useSetPrivateSession } from "@hooks/api";
import { useNow } from "@hooks/ui/useNow";
import { formatTimeOfDay } from "@utils/formatters";
import { privateSessionActive } from "@utils/private-session";

import { EngineRow } from "../../../components/EngineRow";
import { privacyControl, privacyNote } from "../styles";
import type { PrivacyCardProps } from "../types";
import { ClearHistoryDialog } from "./ClearHistoryDialog";

export function ListeningHistoryRows({ user }: PrivacyCardProps) {
  const { t } = useTranslation("settings");
  const overview = usePrivacyOverview();
  const session = useSetPrivateSession();
  const now = useNow();
  const [clearing, setClearing] = useState(false);
  const active = privateSessionActive(user.privateSessionUntil, now);

  return (
    <>
      <EngineRow
        label={t("privacy.history.session.label")}
        anchor="privacy.session"
        labelTrailing={<InfoTooltip description={t("privacy.history.session.description")} />}
        control={
          <div className={privacyControl()}>
            {active && user.privateSessionUntil ? (
              <span className={privacyNote()}>
                {t("privacy.history.session.until", { time: formatTimeOfDay(user.privateSessionUntil) })}
              </span>
            ) : null}
            <Switch
              checked={active}
              disabled={session.isPending}
              onCheckedChange={(enabled) => session.mutate({ enabled })}
              aria-label={t("privacy.history.session.label")}
            />
          </div>
        }
      />
      <EngineRow
        label={t("privacy.history.clear.label")}
        anchor="privacy.clear"
        labelTrailing={<InfoTooltip description={t("privacy.history.clear.description")} />}
        control={
          <Button variant="outline" size="sm" disabled={!overview.data} onClick={() => setClearing(true)}>
            {t("privacy.history.clear.open")}
          </Button>
        }
      />
      {overview.data ? (
        <ClearHistoryDialog open={clearing} history={overview.data.history} onClose={() => setClearing(false)} />
      ) : null}
    </>
  );
}
