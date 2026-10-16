"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";

import { dirtyLabels } from "./helpers";
import { useSaveScopeState } from "./SettingsSaveScope";
import { pageSaveBar, pageSaveBarNames, pageSaveBarSummary } from "./styles";

export function PageSaveBar() {
  const { t } = useTranslation("settings");
  const state = useSaveScopeState();
  if (!state || (state.dirty.length === 0 && !state.saving)) return null;

  const names = dirtyLabels(state.dirty);

  return (
    <div className={pageSaveBar()} role="region" aria-label={t("shell.saveBar.region")}>
      <p className={pageSaveBarSummary()} aria-live="polite">
        {t("shell.saveBar.summary", { count: state.dirty.length })}
        {names.length > 0 ? <span className={pageSaveBarNames()}>{names.join(", ")}</span> : null}
      </p>
      <Button variant="ghost" size="sm" onClick={state.cancelAll} disabled={state.saving}>
        {t("shell.saveBar.cancel")}
      </Button>
      <Button size="sm" onClick={() => void state.saveAll()} disabled={state.saving || state.saveDisabled}>
        {state.saving ? t("shell.saveBar.saving") : t("shell.saveBar.save")}
      </Button>
    </div>
  );
}
