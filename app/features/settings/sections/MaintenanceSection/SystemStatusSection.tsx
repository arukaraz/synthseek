"use client";

import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@components/ui/EmptyState";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useSystemStatus } from "@hooks/api/queries/useSystemStatus";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { formatDateTime } from "@utils/formatters";

import { problemKey } from "./helpers";
import { MaintenancePage } from "./MaintenancePage";
import { problemList, statusLoadError } from "./styles";
import { SystemProblemRow } from "./SystemProblemRow";

export function SystemStatusSection() {
  const { t } = useTranslation("settings");
  const { isAdmin } = useAuthContext();
  const status = useSystemStatus(isAdmin);

  return (
    <MaintenancePage surface="systemStatus">
      {status.data ? (
        status.data.problems.length > 0 ? (
          <ul className={problemList()}>
            {status.data.problems.map((problem) => (
              <SystemProblemRow key={problemKey(problem)} problem={problem} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={CircleCheck}
            title={t("maintenance.systemStatus.allClear")}
            description={
              status.data.checkedAt
                ? t("maintenance.systemStatus.lastChecked", { time: formatDateTime(status.data.checkedAt) })
                : ""
            }
          />
        )
      ) : status.isError ? (
        <p className={statusLoadError()} role="alert">
          {t("maintenance.systemStatus.loadError")}
        </p>
      ) : (
        <SectionLoading />
      )}
    </MaintenancePage>
  );
}
