"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsNavigate } from "../../components/SettingsSaveScope";

export function LocalPlaybackCard() {
  const { t } = useTranslation("settings");
  const navigate = useSettingsNavigate();

  return (
    <SettingsCard title={t("mediaServers.order.local")} description={t("mediaServers.local.description")}>
      <p className="text-fg/60 text-sm">{t("mediaServers.local.nothingToSet")}</p>
      <div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/settings/library/paths")}>
          {t("mediaServers.local.openLibrary")}
        </Button>
      </div>
    </SettingsCard>
  );
}
