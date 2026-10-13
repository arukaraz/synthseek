"use client";

import { HardDrive } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useRemoveStagedRelease } from "@hooks/api/mutations/settings/useStagedReleases";
import { useKeptReleases } from "@hooks/api/queries/useKeptReleases";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { formatBytes, formatTimeUntil } from "@utils/formatters";

import {
  keptCardBody,
  keptCardRow,
  keptInfoTrigger,
  releaseCard,
  releaseCardHeader,
  releaseCardText,
  releaseCardTitle,
  releaseStack,
} from "./styles";
import type { KeptReleaseNoticeProps } from "./types";

export function KeptReleaseNotice({ request }: KeptReleaseNoticeProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const { isAdmin } = useAuthContext();
  const kept = useKeptReleases(request.id, request.contentType);
  const remove = useRemoveStagedRelease();
  const entries = kept.data ?? [];

  if (entries.length === 0) return null;

  return (
    <div className={releaseStack()}>
      {entries.map((entry) => (
        <section key={entry.id} className={releaseCard({ tone: "kept" })} data-testid="kept-release">
          <div className={keptCardRow()}>
            <div className={keptCardBody()}>
              <div className={releaseCardHeader()}>
                <HardDrive className="text-success-vivid" aria-hidden="true" />
                <span className={releaseCardTitle()}>
                  {t("release.keptTitle")}
                  <InfoTooltip
                    trigger="click"
                    side="bottom"
                    triggerLabel={t("release.keptInfoLabel")}
                    description={t("release.keptInfo")}
                    secondary={isAdmin ? t("release.keptInfoDelete") : undefined}
                    className={keptInfoTrigger()}
                  />
                </span>
              </div>
              <span className={releaseCardText()}>
                {t("release.keptMeta", {
                  source: sourceLabel(entry.source),
                  size: formatBytes(entry.sizeBytes),
                  when: formatTimeUntil(entry.expiresAt),
                })}
              </span>
              <span className={releaseCardText()}>{t("release.keptReuse")}</span>
            </div>
            {isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => remove.mutate({ id: entry.id })}
                disabled={remove.isPending}
              >
                {t("release.keptDelete")}
              </Button>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}
