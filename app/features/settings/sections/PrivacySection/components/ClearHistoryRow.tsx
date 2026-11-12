"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { usePrivacyOverview } from "@hooks/api";

import { EngineRow } from "../../../components/EngineRow";
import { ClearHistoryDialog } from "./ClearHistoryDialog";

export function ClearHistoryRow() {
  const { t } = useTranslation("settings");
  const overview = usePrivacyOverview();
  const [clearing, setClearing] = useState(false);

  return (
    <>
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
