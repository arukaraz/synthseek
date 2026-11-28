"use client";

import { useTranslation } from "react-i18next";

import { setupAsk, statusStripAction } from "../styles";
import type { SetupLoadErrorProps } from "../types";
import { StatusStrip } from "./StatusStrip";

export function SetupLoadError({ retry }: SetupLoadErrorProps) {
  const { t } = useTranslation("setup");

  return (
    <div className={setupAsk()}>
      <StatusStrip
        tone="error"
        message={t("shell.loadError")}
        action={
          <button type="button" onClick={retry} className={statusStripAction()}>
            {t("shell.retry")}
          </button>
        }
      />
    </div>
  );
}
