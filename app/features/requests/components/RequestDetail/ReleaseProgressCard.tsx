"use client";

import { Clock, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ProgressBar } from "@components/ui/ProgressBar";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { formatBytes } from "@utils/formatters";

import { releaseFigures } from "./helpers";
import {
  releaseCard,
  releaseCardHeader,
  releaseCardName,
  releaseCardPercent,
  releaseCardText,
  releaseCardTitle,
} from "./styles";
import type { ReleaseProgressCardProps } from "./types";

export function ReleaseProgressCard({ release }: ReleaseProgressCardProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const source = sourceLabel(release.source);

  if (release.state === "queued") {
    return (
      <section className={releaseCard({ tone: "queued" })} data-testid="release-progress" data-state="queued">
        <div className={releaseCardHeader()}>
          <Clock className="text-warning-vivid" aria-hidden="true" />
          <span className={releaseCardTitle()}>{t("release.queuedTitle", { source })}</span>
        </div>
        <p className={releaseCardText()}>{t("release.queuedDescription", { source })}</p>
      </section>
    );
  }

  const figures = releaseFigures(release, {
    size: (done, total) => t("release.fetchingSize", { done: formatBytes(done), total: formatBytes(total) }),
    eta: (minutes) => t("release.fetchingEta", { minutes }),
  });

  return (
    <section className={releaseCard({ tone: "fetching" })} data-testid="release-progress" data-state="fetching">
      <div className={releaseCardHeader()}>
        <Download className="text-primary-400" aria-hidden="true" />
        <span className={releaseCardTitle()}>{t("release.fetchingTitle", { source })}</span>
        <span className={releaseCardPercent()}>{release.percent}%</span>
      </div>
      <ProgressBar progress={release.percent} isActive size="md" />
      {figures.length > 0 ? <p className={releaseCardText()}>{figures.join(" · ")}</p> : null}
      {release.title !== null ? (
        <span className={releaseCardName()} title={release.title}>
          {release.title}
        </span>
      ) : null}
    </section>
  );
}
