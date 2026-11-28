"use client";

import { useTranslation } from "react-i18next";

import { signInNoticeTitle } from "../styles";
import type { SignInFailureNoticeProps } from "../types";
import { SignInNotice } from "./SignInNotice";

export function SignInFailureNotice({ failure, id }: SignInFailureNoticeProps) {
  const { t } = useTranslation("errors");

  if (failure.kind === "pendingApproval") {
    return (
      <SignInNotice tone="neutral" id={id}>
        <span className={signInNoticeTitle()}>{t("ACCOUNT_PENDING_APPROVAL.title")}</span>
        <span>{t("ACCOUNT_PENDING_APPROVAL.description")}</span>
      </SignInNotice>
    );
  }

  return (
    <SignInNotice tone="error" id={id}>
      <span className={signInNoticeTitle()}>{failure.title}</span>
      {failure.description ? <span>{failure.description}</span> : null}
    </SignInNotice>
  );
}
