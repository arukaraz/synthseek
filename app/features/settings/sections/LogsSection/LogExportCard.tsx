"use client";

import { useState } from "react";
import { Archive } from "lucide-react";

import { Button } from "@components/ui/Button";
import { triggerDownload } from "@utils/download";

import { SettingsCard } from "../../components/SettingsCard";
import { ARCHIVE_FILENAME, ARCHIVE_URL, EXPORT_CARD_DESCRIPTION } from "./constants";
import { exportActions } from "./styles";

export function LogExportCard() {
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
    <SettingsCard title="Export all logs" description={EXPORT_CARD_DESCRIPTION}>
      <div className={exportActions()}>
        <Button variant="outline" size="sm" onClick={handleArchive} disabled={busy}>
          <Archive />
          {busy ? "Preparing zip…" : "Download all logs (zip)"}
        </Button>
      </div>
    </SettingsCard>
  );
}
