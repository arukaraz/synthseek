"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Notice } from "@components/ui/Notice";
import { useSaveLibraryNaming } from "@hooks/api/mutations/library/useLibraryNaming";
import { useLibraryNamingCurrent, useLibraryNamingPreview } from "@hooks/api/queries/useLibraryNaming";
import { useDebounce } from "@hooks/ui/useDebounce";

import { ResetDefaultsButton } from "../../components/ResetDefaultsButton";
import { SaveBar } from "../../components/SaveBar";
import { SettingsCard } from "../../components/SettingsCard";
import { SettingsField } from "../../components/SettingsField";
import { SettingsTextInput } from "../../components/SettingsTextInput";
import {
  namingHint,
  namingSampleList,
  namingToken,
  namingTokenList,
  namingTokenMeaning,
  namingTokenName,
  scanStat,
  scanStatGrid,
  scanStatLabel,
  scanStatValue,
} from "../../styles";
import { PREVIEW_DEBOUNCE_MS } from "./constants";
import type { NamingToken } from "./types";

export function NamingCard() {
  const { t } = useTranslation("settings");
  const current = useLibraryNamingCurrent();
  const save = useSaveLibraryNaming();
  const [draft, setDraft] = useState<string | null>(null);

  const saved = current.data?.template ?? "";
  const template = draft ?? saved;
  const debounced = useDebounce(template, { delay: PREVIEW_DEBOUNCE_MS });
  const preview = useLibraryNamingPreview(debounced, current.isSuccess && debounced.length > 0);
  const invalid = preview.data?.outcome === "invalid" ? preview.data : null;
  const counts = preview.data?.outcome === "valid" ? preview.data : null;
  const isDirty = draft !== null && draft !== saved;

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
        <ResetDefaultsButton
          onReset={() => setDraft(current.data?.defaultTemplate ?? saved)}
          disabled={save.isPending}
        />
      }
    >
      <SettingsField label={t("libraryNaming.template.label")} helper={t("libraryNaming.template.description")}>
        <SettingsTextInput
          value={template}
          onChange={setDraft}
          disabled={save.isPending}
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

      {counts ? (
        <>
          <div className={scanStatGrid()}>
            <div className={scanStat()}>
              <span className={scanStatLabel()}>{t("libraryNaming.stats.inPlace")}</span>
              <span className={scanStatValue()}>{counts.inPlace.toLocaleString()}</span>
            </div>
            <div className={scanStat()}>
              <span className={scanStatLabel()}>{t("libraryNaming.stats.toMove")}</span>
              <span className={scanStatValue()}>{counts.moves.toLocaleString()}</span>
            </div>
            <div className={scanStat()}>
              <span className={scanStatLabel()}>{t("libraryNaming.stats.rejected")}</span>
              <span className={scanStatValue()}>{counts.rejected.toLocaleString()}</span>
            </div>
          </div>

          {counts.rejected > 0 ? (
            <Notice variant="warning" title={t("libraryNaming.rejectedNotice", { count: counts.rejected })}>
              <ul className="flex flex-col gap-0.5">
                {counts.rejectionsByReason.map((entry) => (
                  <li key={entry.reason}>
                    {t(`libraryOrganise.rejectedReason.${entry.reason}`, { count: entry.count })}
                  </li>
                ))}
              </ul>
            </Notice>
          ) : null}

          {counts.moveSample.length > 0 ? (
            <ul className={namingSampleList()}>
              {counts.moveSample.map((move) => (
                <li key={move.from} className="truncate">
                  {move.from} → {move.to}
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      <SaveBar
        isDirty={isDirty}
        isSaving={save.isPending}
        saveDisabled={invalid !== null || preview.isFetching || debounced !== template}
        onSave={() => {
          save.mutate(
            { template },
            {
              onSuccess: (result) => {
                if (result.outcome === "saved") setDraft(null);
              },
            }
          );
        }}
        onCancel={() => setDraft(null)}
      />
    </SettingsCard>
  );
}
