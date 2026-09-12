"use client";

import { Eye, Loader2, Square } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { useCancelLibraryOrganise } from "@hooks/api/mutations/library/useLibraryOrganiseControls";
import {
  useLibraryNamingCurrent,
  useLibraryNamingPreview,
  useLibraryNamingSamples,
} from "@hooks/api/queries/useLibraryNaming";
import { useLibraryOrganiseStatus } from "@hooks/api/queries/useLibraryOrganise";
import { useDebounce } from "@hooks/ui/useDebounce";

import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import { namingHint, namingToken, namingTokenList, namingTokenMeaning, namingTokenName } from "../../styles";
import { PREVIEW_DEBOUNCE_MS } from "./constants";
import { percentDone, runOutcome, sampleLabelKey } from "./helpers";
import { PreviewModal } from "./PreviewModal";
import { sampleLabel, sampleList, samplePath, sampleRow, statNumber, statPair, statStrip, statWord } from "./styles";
import type { NamingToken } from "./types";

export function NamingCard() {
  const { t } = useTranslation("settings");
  const current = useLibraryNamingCurrent();
  const [draft, setDraft] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const status = useLibraryOrganiseStatus();
  const cancel = useCancelLibraryOrganise();

  const saved = current.data?.template ?? "";
  const template = draft ?? saved;
  const debounced = useDebounce(template, { delay: PREVIEW_DEBOUNCE_MS });
  const ready = current.isSuccess && debounced.length > 0;
  const preview = useLibraryNamingPreview(debounced, ready);
  const samples = useLibraryNamingSamples(debounced, ready);

  const invalid = preview.data?.outcome === "invalid" ? preview.data : null;
  const counts = preview.data?.outcome === "valid" ? preview.data : null;
  const running = status.data?.running === true;
  const outcome = runOutcome(status.data);
  const settled = debounced === template && !preview.isFetching;

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
    <SettingsCard
      title={t("libraryNaming.card.title")}
      description={t("libraryNaming.card.description")}
      trailing={
        <ResetDefaultsButton onReset={() => setDraft(current.data?.defaultTemplate ?? saved)} disabled={running} />
      }
    >
      <SettingsField label={t("libraryNaming.template.label")} helper={t("libraryNaming.template.description")}>
        <SettingsTextInput
          value={template}
          onChange={setDraft}
          disabled={running}
          ariaLabel={t("libraryNaming.template.label")}
        />
      </SettingsField>

      <ul className={namingTokenList()}>
        {(current.data?.tokens ?? []).map((token: NamingToken) => (
          <li key={token.name} className={namingToken()}>
            <span className={namingTokenName()}>{token.example}</span>
            <span className={namingTokenMeaning()}>{t(`libraryNaming.tokens.${token.name}`)}</span>
          </li>
        ))}
      </ul>
      <p className={namingHint()}>{t("libraryNaming.rules")}</p>

      {invalid ? <Notice variant="danger" title={t(`libraryNaming.problem.${invalid.problem}`)} /> : null}

      {samples.data && invalid === null ? (
        <div className={sampleList()}>
          {samples.data.samples.map((sample) => {
            const label = sampleLabelKey(sample.id);
            if (label === null) return null;
            return (
              <div key={sample.id} className={sampleRow()}>
                <span className={sampleLabel()}>{t(label)}</span>
                <span className={samplePath()}>{sample.path ?? t("libraryNaming.samples.unrenderable")}</span>
              </div>
            );
          })}
        </div>
      ) : null}

      {counts ? (
        <div className={statStrip()}>
          <span className={statPair()}>
            <span className={statNumber()}>{counts.moves.toLocaleString()}</span>
            <span className={statWord()}>{t("libraryNaming.stats.toMove")}</span>
          </span>
          <span className={statPair()}>
            <span className={statNumber()}>{counts.inPlace.toLocaleString()}</span>
            <span className={statWord()}>{t("libraryNaming.stats.inPlace")}</span>
          </span>
          {counts.rejected > 0 ? (
            <span className={statPair()}>
              <span className={statNumber()}>{counts.rejected.toLocaleString()}</span>
              <span className={statWord()}>{t("libraryNaming.stats.rejected")}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {counts && counts.rejected > 0 ? (
        <Notice variant="info" title={t("libraryNaming.rejectedNotice", { count: counts.rejected })}>
          <ul className="flex flex-col gap-0.5">
            {counts.rejectionsByReason.map((entry) => (
              <li key={entry.reason}>{t(`libraryOrganise.rejectedReason.${entry.reason}`, { count: entry.count })}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {running && status.data ? (
        <div className="flex items-center gap-3">
          <span className="text-fg/70 text-sm tabular-nums">
            {t("libraryOrganise.progress", {
              processed: status.data.processed,
              total: status.data.total,
              percent: percentDone(status.data.processed, status.data.total),
            })}
          </span>
          <Button variant="secondary" size="sm" onClick={() => cancel.mutate()} disabled={status.data.cancelling}>
            <Square className="size-4" />
            {t("libraryOrganise.actions.stop")}
          </Button>
        </div>
      ) : null}

      {outcome && !running ? (
        <Notice
          variant={outcome.failed > 0 || outcome.companionsFailed > 0 ? "warning" : "success"}
          title={t("libraryOrganise.finished", {
            moved: outcome.moved,
            companions: outcome.companionsMoved,
            duration: outcome.duration,
          })}
        >
          {outcome.failed > 0 ? <p>{t("libraryOrganise.finishedFailures", { count: outcome.failed })}</p> : null}
          {outcome.companionsFailed > 0 ? (
            <p>{t("libraryOrganise.finishedCompanionsFailed", { count: outcome.companionsFailed })}</p>
          ) : null}
        </Notice>
      ) : null}

      <div className="flex justify-end">
        <Button
          onClick={() => setPreviewing(true)}
          disabled={running || invalid !== null || !settled || (counts?.moves ?? 0) === 0}
        >
          {settled ? <Eye className="size-4" /> : <Loader2 className="size-4 animate-spin" />}
          {t("libraryNaming.previewAction", {
            count: counts?.moves ?? 0,
            formatted: (counts?.moves ?? 0).toLocaleString(),
          })}
        </Button>
      </div>

      <PreviewModal open={previewing} onOpenChange={setPreviewing} template={template} />
    </SettingsCard>
  );
}
