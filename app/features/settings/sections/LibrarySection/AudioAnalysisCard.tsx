"use client";

import { Loader2, Play, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ProgressBar } from "@components/ui/ProgressBar";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useUpdateAudioAnalysis } from "@hooks/api/mutations/settings/useUpdateAudioAnalysis";
import { useStopJob } from "@hooks/api/mutations/jobs/useStopJob";
import { useTriggerJob } from "@hooks/api/mutations/jobs/useTriggerJob";
import { useAudioAnalysisCoverage } from "@hooks/api/queries/useAudioAnalysisCoverage";
import { useJobs } from "@hooks/api/queries/useJobs";
import { useSettings } from "@hooks/api/queries/useSettings";
import { formatCount } from "@utils/formatters";

import { SettingsCard } from "../../components/SettingsCard";
import { AUDIO_ANALYSIS_JOB, AUDIO_ANALYSIS_SPEEDS } from "./constants";
import { coveragePercent } from "./helpers";
import { analysisFacts, analysisFact, analysisFactLabel, analysisFactValue, analysisRow } from "./styles";

export function AudioAnalysisCard() {
  const { t } = useTranslation("settings");
  const { data: coverage } = useAudioAnalysisCoverage();
  const { data: settings } = useSettings();
  const { data: jobs } = useJobs();
  const update = useUpdateAudioAnalysis();
  const trigger = useTriggerJob();
  const stop = useStopJob();
  const job = jobs?.find((entry) => entry.id === AUDIO_ANALYSIS_JOB);
  const running = job?.running === true || trigger.isPending;
  const speed = settings?.library.audioAnalysis.speed;

  return (
    <SettingsCard title={t("audioAnalysis.title")} description={t("audioAnalysis.description")}>
      <ProgressBar progress={coverage ? coveragePercent(coverage) : 0} isActive={running} size="sm" />
      <div className={analysisFacts()}>
        <div className={analysisFact()}>
          <span className={analysisFactLabel()}>{t("audioAnalysis.analyzed")}</span>
          <span className={analysisFactValue()}>
            {t("audioAnalysis.ofTotal", {
              done: formatCount(coverage?.analyzed ?? 0),
              total: formatCount(coverage?.total ?? 0),
            })}
          </span>
        </div>
        <div className={analysisFact()}>
          <span className={analysisFactLabel()}>{t("audioAnalysis.retry")}</span>
          <span className={analysisFactValue()}>{formatCount(coverage?.failed ?? 0)}</span>
        </div>
        <div className={analysisFact()}>
          <span className={analysisFactLabel()}>{t("audioAnalysis.state")}</span>
          <span className={analysisFactValue()}>{t(running ? "audioAnalysis.running" : "audioAnalysis.idle")}</span>
        </div>
      </div>
      <div className={analysisRow()}>
        <span className={analysisFactLabel()}>{t("audioAnalysis.speed")}</span>
        {speed ? (
          <SegmentedControl
            ariaLabel={t("audioAnalysis.speed")}
            value={speed}
            disabled={update.isPending}
            options={AUDIO_ANALYSIS_SPEEDS.map((value) => ({ value, label: t(`audioAnalysis.speeds.${value}`) }))}
            onChange={(next) => update.mutate({ speed: next })}
          />
        ) : null}
      </div>
      <div className={analysisRow()}>
        {running && job?.canStop ? (
          <Button variant="secondary" size="sm" onClick={() => stop.mutate({ id: AUDIO_ANALYSIS_JOB })}>
            <Square />
            {t("audioAnalysis.pause")}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={running}
            onClick={() => trigger.mutate({ id: AUDIO_ANALYSIS_JOB })}
          >
            {running ? <Loader2 className="animate-spin" /> : <Play />}
            {t("audioAnalysis.start")}
          </Button>
        )}
      </div>
      <p className="text-fg/60 text-xs">{t("audioAnalysis.hint")}</p>
    </SettingsCard>
  );
}
