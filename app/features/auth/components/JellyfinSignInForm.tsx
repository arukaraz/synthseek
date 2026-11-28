"use client";

import { User } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { useJellyfinSignIn } from "@hooks/api/mutations/auth/useJellyfinSignIn";

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
import type { JellyfinCredentials, JellyfinSignInFormProps } from "../types";
import { SignInAttemptNotices } from "./SignInAttemptNotices";

export function JellyfinSignInForm({ id }: JellyfinSignInFormProps) {
  const { t } = useTranslation("auth");
  const usernameId = useId();
  const passwordId = useId();
  const noticeId = useId();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useJellyfinSignIn();
  const { state, submit } = useLoginAttempt<JellyfinCredentials>({
    run: signIn.mutateAsync,
    invalidCredentialsTitle: t("auth.jellyfin.invalidCredentials"),
  });

  const pending = state.kind === "pending";
  const rejected = state.kind === "rejected";

  useEffect(() => {
    if (state.kind !== "rejected") return;
    passwordRef.current?.focus();
    passwordRef.current?.select();
  }, [state]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    void submit({ username: username.trim(), password });
  };

  return (
    <form id={id} onSubmit={handleSubmit} className={signInForm()}>
      <fieldset disabled={state.kind === "throttled"} className={signInFields()}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={usernameId} className={authFieldLabel()}>
            {t("auth.jellyfin.usernameLabel")}
          </label>
          <div className={authInputRow({ invalid: rejected })}>
            <User className={authInputIcon()} aria-hidden="true" />
            <input
              id={usernameId}
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              placeholder={t("auth.jellyfin.usernamePlaceholder")}
              aria-invalid={rejected || undefined}
              aria-describedby={rejected ? noticeId : undefined}
              className={authInputControl()}
            />
          </div>
        </div>

        <PasswordField
          id={passwordId}
          inputRef={passwordRef}
          label={t("auth.jellyfin.passwordLabel")}
          value={password}
          onChange={setPassword}
          invalid={rejected}
          describedBy={rejected ? noticeId : undefined}
        />

        <SignInAttemptNotices state={state} noticeId={noticeId} />

        <button type="submit" disabled={pending} aria-busy={pending} className={authSubmitButton()}>
          {pending ? t("auth.jellyfin.submitting") : t("auth.jellyfin.submit")}
        </button>
      </fieldset>
    </form>
  );
}
