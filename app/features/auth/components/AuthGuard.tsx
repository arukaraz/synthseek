"use client";

import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { BrandedLoader } from "@components/ui/BrandedLoader";
import { useSetupRedirect } from "@hooks/ui/useSetupRedirect";

import { AuthRecoveryPanel } from "./AuthRecoveryPanel";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { t } = useTranslation("auth");
  const gate = useSetupRedirect("app");

  if (gate.status === "resolving") return <BrandedLoader label={t("auth.guard.loadingLibrary")} />;
  if (gate.status === "error") return <AuthRecoveryPanel onRetry={gate.retry} />;
  if (gate.status !== "ready") return null;

  return <>{children}</>;
}
