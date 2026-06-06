"use client";

import { useTranslation } from "react-i18next";

import { AppLogo } from "@components/ui/AppLogo";
import { Button } from "@components/ui/Button";
import { Spinner } from "@components/ui/Spinner";
import { useAutoRetry } from "@hooks/ui/useAutoRetry";

import {
  recoveryCard,
  recoveryEyebrow,
  recoveryGrid,
  recoveryMessage,
  recoveryOrb,
  recoveryStage,
  recoveryStatusRow,
  recoveryTitle,
} from "./styles";
import type { AuthRecoveryPanelProps } from "./types";

export function AuthRecoveryPanel({ onRetry }: AuthRecoveryPanelProps) {
  const { t } = useTranslation("auth");
  const { retryNow, isRetrying } = useAutoRetry({ onRetry });

  return (
    <div role="alert" aria-live="assertive" className={recoveryStage()}>
      <div aria-hidden="true" className={recoveryGrid()} />
      <div aria-hidden="true" className={recoveryOrb()} />

      <div className={recoveryCard()}>
        <AppLogo iconClassName="h-11 w-auto sm:h-12" wordmarkClassName="sr-only" />
        <p className={recoveryEyebrow()}>{t("auth.guard.error.eyebrow")}</p>
        <h1 className={recoveryTitle()}>{t("auth.guard.error.title")}</h1>
        <p className={recoveryMessage()}>{t("auth.guard.error.description")}</p>

        {isRetrying ? (
          <div className={recoveryStatusRow()}>
            <Spinner size="sm" label={t("auth.guard.error.retrying")} />
            <span>{t("auth.guard.error.retrying")}</span>
          </div>
        ) : (
          <Button type="button" onClick={retryNow}>
            {t("auth.guard.error.retry")}
          </Button>
        )}
      </div>
    </div>
  );
}
