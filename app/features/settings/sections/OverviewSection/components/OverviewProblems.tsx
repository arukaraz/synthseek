"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { useSystemStatus } from "@hooks/api/queries/useSystemStatus";

import { useSettingsNavigate } from "../../../components/SettingsSaveScope";
import { problemKey } from "../../../helpers";
import { SYSTEM_STATUS_HREF } from "../constants";
import { problemBody } from "../styles";

export function OverviewProblems() {
  const { t } = useTranslation("settings");
  const status = useSystemStatus(true);
  const navigate = useSettingsNavigate();

  return (
    <>
      {(status.data?.problems ?? []).map((problem) => (
        <Notice
          key={problemKey(problem)}
          variant="danger"
          title={t(`maintenance.systemStatus.problems.${problem.kind}.title`)}
        >
          <div className={problemBody()}>
            <span>{t("overview.problems.body")}</span>
            <Button size="sm" variant="outline" onClick={() => navigate(SYSTEM_STATUS_HREF)}>
              {t("overview.problems.seeFix")}
            </Button>
          </div>
        </Notice>
      ))}
    </>
  );
}
