"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { triggerDownload } from "@utils/download";

import { SettingsCard } from "../../components/SettingsCard";
import { ARCHIVE_FILENAME, ARCHIVE_URL } from "./constants";
import { exportActions } from "./styles";

export function LogExportCard() {
  const { t } = useTranslation("settings");
  const [busy, setBusy] = useState(false);

  const handleArchive = async () => {
    setBusy(true);
    try {
      await triggerDownload(ARCHIVE_URL, ARCHIVE_FILENAME);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsCard title={t("logs.export.title")} description={t("logs.export.description")}>
      <div className={exportActions()}>
        <Button variant="outline" size="sm" onClick={handleArchive} disabled={busy}>
          <Archive />
          {busy ? t("logs.export.preparing") : t("logs.export.download")}
        </Button>
      </div>
    </SettingsCard>
  );
}
