"use client";

import { HardDrive, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { MAX_BULK_TRACK_IDS } from "@hooks/api/mutations/requests/constants";
import { useRetryStorageFailures } from "@hooks/api/mutations/requests/useRetryStorageFailures";
import { useStorageFailureSummary } from "@hooks/api/queries/useStorageFailureSummary";

import { storageFailureActions, storageFailureBody, storageFailureRoot } from "./styles";

export function StorageFailureNotice() {
  const { t } = useTranslation("requests");
  const { data } = useStorageFailureSummary();
  const retry = useRetryStorageFailures();

  if (!data || data.count === 0) return null;

  const retryableNow = Math.min(data.count, MAX_BULK_TRACK_IDS);

  return (
    <div className={storageFailureRoot()}>
      <Notice
        variant={data.downloadsPathBroken ? "danger" : "warning"}
        icon={HardDrive}
        title={t("storageFailure.title", { count: data.count })}
      >
        <div className={storageFailureBody()}>
          <p>{data.downloadsPathBroken ? t("storageFailure.stillBroken") : t("storageFailure.pathReachable")}</p>
          {retryableNow < data.count ? <p>{t("storageFailure.cappedBatch", { count: retryableNow })}</p> : null}
          <div className={storageFailureActions()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => retry.mutate()}
              disabled={retry.isPending || data.downloadsPathBroken}
            >
              <RefreshCw aria-hidden />
              {t("storageFailure.retryAction", { count: retryableNow })}
            </Button>
          </div>
        </div>
      </Notice>
    </div>
  );
}
