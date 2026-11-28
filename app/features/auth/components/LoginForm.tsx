"use client";

import { Mail } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useLocalLogin } from "@hooks/api/mutations/auth/useLocalLogin";
import { useDesktopAutoFocus } from "@hooks/ui/useDesktopAutoFocus";

import { useLoginAttempt } from "../hooks/useLoginAttempt";
import {
  authFieldLabel,
  authInputControl,
  authInputIcon,
  authInputRow,
  authSubmitButton,
  signInFields,
  signInForm,
} from "../styles";
import type { LoginCredentials } from "../types";
import { SignInAttemptNotices } from "./SignInAttemptNotices";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const emailId = useId();
  const passwordId = useId();
  const noticeId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLocalLogin();
  const { state, submit } = useLoginAttempt<LoginCredentials>({
    run: login.mutateAsync,
    invalidCredentialsTitle: t("auth.login.errors.invalidCredentials"),
  });

  useDesktopAutoFocus(emailRef);

  const pending = state.kind === "pending";
  const rejected = state.kind === "rejected";

  useEffect(() => {
    if (state.kind === "rejected") {
      passwordRef.current?.focus();
      passwordRef.current?.select();
    } else if (state.kind === "released" && document.activeElement === document.body) {
      emailRef.current?.focus();
    }
  }, [state]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    void submit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={signInForm()}>
      <fieldset disabled={state.kind === "throttled"} className={signInFields()}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={emailId} className={authFieldLabel()}>
            {t("auth.form.emailLabel")}
          </label>
          <div className={authInputRow({ invalid: rejected })}>
            <Mail className={authInputIcon()} aria-hidden="true" />
            <input
              ref={emailRef}
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder={t("auth.form.emailPlaceholder")}
              aria-invalid={rejected || undefined}
              aria-describedby={rejected ? noticeId : undefined}
              className={authInputControl()}
            />
          </div>
        </div>

        <PasswordField
          id={passwordId}
          inputRef={passwordRef}
          value={password}
          onChange={setPassword}
          invalid={rejected}
          describedBy={rejected ? noticeId : undefined}
        />

        <SignInAttemptNotices state={state} noticeId={noticeId} />

        <button type="submit" disabled={pending} aria-busy={pending} className={authSubmitButton()}>
          {pending ? t("auth.form.submitting") : t("auth.form.submit")}
        </button>
      </fieldset>
    </form>
  );
}
