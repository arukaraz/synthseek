"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useFinishWizard } from "@hooks/api/mutations/settings/useFinishWizard";
import { useSetupProgress } from "@hooks/api/queries/setup/useSetupProgress";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { HOME_PATH } from "@utils/returnPath";

import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { SummaryRow } from "../components/SummaryRow";
import { summaryRowsOf } from "../helpers";
import { setupForm, summaryList } from "../styles";
import type { StepProps } from "../types";

export function SummaryStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const router = useRouter();
  const { currentUser } = useAuthContext();
  const progress = useSetupProgress({ enabled: true }).data;
  const finish = useFinishWizard({ silent: true });
  const [failed, setFailed] = useState(false);

  if (!progress) return null;

  const rows = summaryRowsOf(progress, currentUser?.username ?? "");

  const handleFinish = async () => {
    setFailed(false);
    try {
      await finish.mutateAsync();
    } catch {
      setFailed(true);
      return;
    }
    router.replace(HOME_PATH);
  };

  return (
    <QuestionFrame step="summary" focusKey="summary" title={t("summary.title")}>
      <div className={setupForm()}>
        <ul className={summaryList()}>
          {rows.map((row) => (
            <SummaryRow key={row.key} label={row.label} value={row.value} outcome={row.outcome} />
          ))}
        </ul>
        {failed ? <StatusStrip tone="error" message={t("summary.failed")} /> : null}
        <StepActions
          onBack={() => onGo("metadata")}
          forwardLabel={finish.isPending ? t("summary.finishing") : t("summary.finish")}
          forwardBusy={finish.isPending}
          onForward={() => void handleFinish()}
        />
      </div>
    </QuestionFrame>
  );
}
