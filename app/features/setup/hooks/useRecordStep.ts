"use client";

import { useState } from "react";

import i18n from "@locale";
import { useRecordSetupOutcome } from "@hooks/api/mutations/setup/useRecordSetupOutcome";

import { failureTextOf } from "../helpers";
import type { RecordableQuestionId, RecordStep, SetupNavigate, SetupOutcome, SetupStepId } from "../types";

export function useRecordStep(question: RecordableQuestionId, onGo: SetupNavigate): RecordStep {
  const mutation = useRecordSetupOutcome();
  const [failure, setFailure] = useState<string | null>(null);

  const record = async (outcome: SetupOutcome, next: SetupStepId) => {
    setFailure(null);
    try {
      await mutation.mutateAsync({ question, outcome });
    } catch (error) {
      setFailure(failureTextOf(error, i18n.t("setup:actions.recordFailed")));
      return;
    }
    onGo(next);
  };

  return { record, pending: mutation.isPending, failure, clearFailure: () => setFailure(null) };
}
