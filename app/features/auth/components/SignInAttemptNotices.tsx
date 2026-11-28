"use client";

import { useTranslation } from "react-i18next";

import type { SignInAttemptNoticesProps } from "../types";
import { SignInFailureNotice } from "./SignInFailureNotice";
import { ThrottleNotice } from "./ThrottleNotice";

export function SignInAttemptNotices({ state, noticeId }: SignInAttemptNoticesProps) {
  const { t } = useTranslation("auth");

  return (
    <>
      {state.kind === "rejected" ? (
        <SignInFailureNotice failure={{ kind: "message", ...state.message }} id={noticeId} />
      ) : null}

      {state.kind === "pendingApproval" ? <SignInFailureNotice failure={state} id={noticeId} /> : null}

      {state.kind === "throttled" ? (
        <ThrottleNotice deadline={state.deadline} retryAfterSeconds={state.retryAfterSeconds} />
      ) : null}

      <p role="status" className="sr-only">
        {state.kind === "released" ? t("auth.login.throttled.released") : ""}
      </p>
    </>
  );
}
