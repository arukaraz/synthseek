"use client";

import { Eye, HelpCircle, Loader2, Square } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { IconButton } from "@components/ui/IconButton";
import { Notice } from "@components/ui/Notice";
import { ProgressBar } from "@components/ui/ProgressBar";
import { useCancelLibraryOrganise } from "@hooks/api/mutations/library/useLibraryOrganiseControls";
import { useLibraryNamingCurrent, useLibraryNamingPreview } from "@hooks/api/queries/useLibraryNaming";
import { useLibraryOrganiseStatus } from "@hooks/api/queries/useLibraryOrganise";
import { useDebounce } from "@hooks/ui/useDebounce";
import { formatElapsed } from "@utils/formatters";

import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { namingHint } from "../../styles";
import { PREVIEW_DEBOUNCE_MS } from "./constants";
import {
  percentDone,
  refuseExtensionTyping,
  runOutcome,
  secondsRemaining,
  withExtension,
  withoutExtension,
} from "./helpers";
import { PreviewModal } from "./PreviewModal";
import {
  progressBottom,
  progressCounts,
  progressPercent,
  progressTop,
  progressWrap,
  templateRow,
  tokensFooterInput,
} from "./styles";
import { TokensModal } from "./TokensModal";

export function NamingCard() {
  const { t } = useTranslation("settings");
  const current = useLibraryNamingCurrent();
  const [draft, setDraft] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [pickingTokens, setPickingTokens] = useState(false);
  const status = useLibraryOrganiseStatus();
  const cancel = useCancelLibraryOrganise();

  const edited = draft ?? withoutExtension(current.data?.template ?? "");
  const settledEdit = useDebounce(edited, { delay: PREVIEW_DEBOUNCE_MS });
  const template = withExtension(edited);
  const preview = useLibraryNamingPreview(
    withExtension(settledEdit),
    current.isSuccess && settledEdit.trim().length > 0
  );

  const invalid = preview.data?.outcome === "invalid" ? preview.data : null;
  const counts = preview.data?.outcome === "valid" ? preview.data : null;
  const running = status.data?.running === true;
  const outcome = runOutcome(status.data);
  const settled = settledEdit === edited && !preview.isFetching;
  const left = secondsRemaining(status.data, Date.now());

  if (current.isLoading) {
    return (
      <SettingsCard title={t("libraryNaming.card.title")} description={t("libraryNaming.card.description")}>
        <span className={namingHint()}>{t("jobs.card.loading")}</span>
      </SettingsCard>
    );
  }

  if (current.isError) {
    return (
      <SettingsCard title={t("libraryNaming.card.title")} description={t("libraryNaming.card.description")}>
        <Notice variant="danger" title={t("libraryNaming.loadFailed")} />
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title={t("libraryNaming.card.title")} description={t("libraryNaming.card.description")}>
      <SettingsField label={t("libraryNaming.template.label")}>
        <div className={templateRow()}>
          <input
            value={edited}
            onChange={(event) => setDraft(refuseExtensionTyping(event.target.value))}
            disabled={running}
            aria-label={t("libraryNaming.template.label")}
            className={tokensFooterInput()}
          />
          <IconButton
            icon={HelpCircle}
            variant="primary"
            aria-label={t("libraryNaming.tokensModal.open")}
            onClick={() => setPickingTokens(true)}
            disabled={running}
          />
        </div>
      </SettingsField>

      {invalid ? <Notice variant="danger" title={t(`libraryNaming.problem.${invalid.problem}`)} /> : null}

      {running && status.data ? (
        <div className={progressWrap()}>
          <div className={progressTop()}>
            <span className={progressPercent()}>{percentDone(status.data.processed, status.data.total)}%</span>
            <span className={progressCounts()}>
              {t("libraryOrganise.progressCounts", {
                processed: status.data.processed.toLocaleString(),
                total: status.data.total.toLocaleString(),
              })}
            </span>
          </div>
          <ProgressBar progress={percentDone(status.data.processed, status.data.total)} isActive size="lg" />
          <div className={progressBottom()}>
            <span className={progressCounts()}>
              {left === null
                ? t("libraryOrganise.estimating")
                : t("libraryOrganise.timeLeft", { time: formatElapsed(left) })}
            </span>
            <Button variant="secondary" size="sm" onClick={() => cancel.mutate()} disabled={status.data.cancelling}>
              <Square className="size-4" />
              {status.data.cancelling ? t("libraryOrganise.actions.stopping") : t("libraryOrganise.actions.stop")}
            </Button>
          </div>
        </div>
      ) : null}

      {outcome && !running ? (
        <Notice
          variant={outcome.failed > 0 || outcome.companionsFailed > 0 ? "warning" : "success"}
          title={t("libraryOrganise.finished", {
            moved: outcome.moved.toLocaleString(),
            companions: outcome.companionsMoved.toLocaleString(),
            duration: outcome.duration,
          })}
        >
          {outcome.failed > 0 ? <p>{t("libraryOrganise.finishedFailures", { count: outcome.failed })}</p> : null}
          {outcome.companionsFailed > 0 ? (
            <p>{t("libraryOrganise.finishedCompanionsFailed", { count: outcome.companionsFailed })}</p>
          ) : null}
        </Notice>
      ) : null}

      {running ? null : (
        <div className="flex justify-end">
          <Button
            onClick={() => setPreviewing(true)}
            disabled={invalid !== null || !settled || (counts?.moves ?? 0) === 0}
          >
            {settled ? <Eye className="size-4" /> : <Loader2 className="size-4 animate-spin" />}
            {settled
              ? t("libraryNaming.previewAction", {
                  count: counts?.moves ?? 0,
                  formatted: (counts?.moves ?? 0).toLocaleString(),
                })
              : t("libraryNaming.preview.loading")}
          </Button>
        </div>
      )}

      <TokensModal
        open={pickingTokens}
        onOpenChange={setPickingTokens}
        template={template}
        edited={edited}
        tokens={current.data?.tokens ?? []}
        problem={invalid?.problem ?? null}
        onTemplateChange={setDraft}
      />
      <PreviewModal open={previewing} onOpenChange={setPreviewing} template={template} />
    </SettingsCard>
  );
}
