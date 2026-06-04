"use client";

import { AtSign, User } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { PasswordField } from "@components/ui/PasswordField";
import { authInputControl, authInputIcon, authInputRow } from "@components/ui/styles";

import { useSetupBootstrap } from "@hooks/api/mutations/auth/useSetupBootstrap";

import { StatusStrip } from "../components/StatusStrip";
import { ADMIN_FIELD_RULES, SETUP_HEADING_IDS } from "../constants";
import { isValidAdminEmail } from "../helpers";
import { fieldError, fieldGroup, fieldHint, fieldLabel } from "../styles";
import { StepShell } from "./StepShell";
import type { AdminStepProps } from "../types";

export function AdminStep({ stepIndex, totalSteps, onComplete }: AdminStepProps) {
  const { t } = useTranslation("setup");
  const bootstrap = useSetupBootstrap();
  const emailId = useId();
  const emailErrorId = useId();
  const usernameId = useId();
  const usernameHintId = useId();
  const passwordId = useId();
  const passwordHintId = useId();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await bootstrap.mutateAsync({ email, username, password });
      onComplete();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("admin.createError"));
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  const emailValid = isValidAdminEmail(email);
  const usernameValid =
    username.length >= ADMIN_FIELD_RULES.usernameMin && username.length <= ADMIN_FIELD_RULES.usernameMax;
  const passwordValid = password.length >= ADMIN_FIELD_RULES.passwordMin;
  const emailInvalid = email.length > 0 && !emailValid;
  const usernameInvalid = username.length > 0 && !usernameValid;
  const passwordInvalid = password.length > 0 && !passwordValid;

  const disabled = !emailValid || !usernameValid || !passwordValid;

  const clearError = () => {
    if (error) setError(null);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <StepShell
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        headingId={SETUP_HEADING_IDS.admin}
        title={t("admin.title")}
        description={t("admin.description")}
        primaryLabel={bootstrap.isPending ? t("admin.creating") : t("admin.submit")}
        primaryDisabled={disabled}
        primaryLoading={bootstrap.isPending}
        primaryType="submit"
        footerError={error ? <StatusStrip tone="error" message={error} /> : undefined}
      >
        <div className={fieldGroup()}>
          <label htmlFor={emailId} className={fieldLabel()}>
            {t("admin.emailLabel")}
          </label>
          <div className={authInputRow({ invalid: emailInvalid })}>
            <AtSign className={authInputIcon()} aria-hidden="true" />
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              required
              autoComplete="email"
              placeholder={t("admin.emailPlaceholder")}
              aria-describedby={emailInvalid ? emailErrorId : undefined}
              aria-invalid={emailInvalid || undefined}
              className={authInputControl()}
            />
          </div>
          {emailInvalid ? (
            <p id={emailErrorId} className={fieldError()}>
              {t("admin.emailError")}
            </p>
          ) : null}
        </div>
        <div className={fieldGroup()}>
          <label htmlFor={usernameId} className={fieldLabel()}>
            {t("admin.usernameLabel")}
          </label>
          <div className={authInputRow({ invalid: usernameInvalid })}>
            <User className={authInputIcon()} aria-hidden="true" />
            <input
              id={usernameId}
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError();
              }}
              required
              minLength={ADMIN_FIELD_RULES.usernameMin}
              maxLength={ADMIN_FIELD_RULES.usernameMax}
              autoComplete="username"
              placeholder={t("admin.usernamePlaceholder")}
              aria-describedby={usernameHintId}
              aria-invalid={usernameInvalid || undefined}
              className={authInputControl()}
            />
          </div>
          <p id={usernameHintId} className={usernameInvalid ? fieldError() : fieldHint()}>
            {usernameInvalid ? t("admin.usernameError") : t("admin.usernameHint")}
          </p>
        </div>
        <div className={fieldGroup()}>
          <PasswordField
            id={passwordId}
            value={password}
            onChange={(value) => {
              setPassword(value);
              clearError();
            }}
            invalid={passwordInvalid}
            autoComplete="new-password"
            minLength={ADMIN_FIELD_RULES.passwordMin}
            describedBy={passwordHintId}
          />
          <p id={passwordHintId} className={passwordInvalid ? fieldError() : fieldHint()}>
            {passwordInvalid ? t("admin.passwordError") : t("admin.passwordHint")}
          </p>
        </div>
      </StepShell>
    </form>
  );
}
