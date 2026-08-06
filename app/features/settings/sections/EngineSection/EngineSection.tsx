"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot, emptyPanel, sectionGrid } from "../../styles";
import { ImportCard } from "./ImportCard";
import { QualityCard } from "./QualityCard";
import { QuarantineCard } from "./QuarantineCard";
import { QueueCard } from "./QueueCard";
import { SmartSearchCard } from "./SmartSearchCard";
import { TimeoutsCard } from "./TimeoutsCard";
import { WantedCard } from "./WantedCard";

export function EngineSection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title={t("header.title")} description={t("header.description")} />
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">{t("header.loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title={t("header.title")} description={t("header.description")} />
        <div className={emptyPanel()}>
          <span className="text-sm text-red-400">
            {t("header.loadError", { message: error?.message ?? t("header.unknownError") })}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("header.title")} description={t("header.description")} />
      <div className={sectionGrid()}>
        <SmartSearchCard initial={data.engine.smartSearch} />
        <TimeoutsCard initial={data.engine.timeouts} />
        <QueueCard initial={data.engine.queue} />
        <ImportCard initial={data.engine.import} />
        <WantedCard initial={data.engine.wanted} />
        <QualityCard initial={data.engine.quality} recycleBin={data.library.recycleBin} />
        <QuarantineCard
          initial={data.engine.import}
          sourceTrust={{
            bannedUsersCount: data.connections.slskd.bannedUsers.length,
            banAfterFailedAttempts: data.engine.search.banAfterFailedAttempts,
          }}
        />
      </div>
    </div>
  );
}
