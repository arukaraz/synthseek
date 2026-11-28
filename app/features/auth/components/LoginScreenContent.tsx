"use client";

import { useTranslation } from "react-i18next";

import { BrandedLoader } from "@components/ui/BrandedLoader";

import { useAuthTransition } from "../hooks/useAuthTransition";
import { signInStage } from "../styles";
import { SignInBackdrop } from "./SignInBackdrop";
import { SignInPanel } from "./SignInPanel";

export function LoginScreenContent() {
  const { t } = useTranslation("auth");
  const { isNavigating } = useAuthTransition();

  if (isNavigating) return <BrandedLoader label={t("auth.login.signingIn")} />;

  return (
    <>
      <SignInBackdrop />
      <div className={signInStage()}>
        <SignInPanel />
      </div>
    </>
  );
}
